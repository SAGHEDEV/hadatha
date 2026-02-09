/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useCallback } from "react"
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit"
import { Notification, NotificationType } from "@/types/notification"
import { CheckCircle2, AlertCircle, Calendar, User, Bell } from "lucide-react"
import { REGISTRY_PACKAGE_ID } from "@/lib/constant"

const NOTIFICATION_STORAGE_KEY = "hadatha_notifications"
const LAST_CHECKED_KEY = "hadatha_last_checked"

// Debug flag - set to true for console logs
const DEBUG = true

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const log = (...args: any[]) => {
    if (DEBUG) console.log("[Notifications]", ...args)
}

// Helper function to decode byte array to string
const decodeBytes = (bytes: number[] | string): string => {
    console.log(bytes)
    if (typeof bytes === 'string') return bytes
    if (!Array.isArray(bytes)) return ''

    try {
        // Convert byte array to string
        return new TextDecoder().decode(new Uint8Array(bytes))
    } catch (error) {
        console.error("Failed to decode bytes:", error)
        return bytes.toString()
    }
}

export const useNotifications = () => {
    const currentAccount = useCurrentAccount()
    const suiClient = useSuiClient()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Load notifications from localStorage
    useEffect(() => {
        if (!currentAccount) {
            setNotifications([])
            return
        }

        const stored = localStorage.getItem(`${NOTIFICATION_STORAGE_KEY}_${currentAccount.address}`)
        if (stored) {
            try {
                const parsed = JSON.parse(stored)
                log("Loaded notifications from storage:", parsed.length)
                setNotifications(parsed)
            } catch (error) {
                console.error("Failed to parse notifications:", error)
                setError("Failed to load notifications")
            }
        }
    }, [currentAccount])

    // Save notifications to localStorage
    const saveNotifications = useCallback((notifs: Notification[]) => {
        if (!currentAccount) return
        try {
            localStorage.setItem(
                `${NOTIFICATION_STORAGE_KEY}_${currentAccount.address}`,
                JSON.stringify(notifs)
            )
            setNotifications(notifs)
            log("Saved notifications:", notifs.length)
        } catch (error) {
            console.error("Failed to save notifications:", error)
            setError("Failed to save notifications")
        }
    }, [currentAccount])

    // Fetch new events from the blockchain
    const fetchNewEvents = useCallback(async () => {
        if (!currentAccount) {
            log("No account connected")
            return
        }

        console.log("REGISTRY_PACKAGE_ID", REGISTRY_PACKAGE_ID)
        if (!REGISTRY_PACKAGE_ID) {
            console.error("PACKAGE_ID is not configured")
            setError("Package ID not configured")
            return
        }

        log("Fetching new events for account:", currentAccount.address)
        setIsLoading(true)
        setError(null)

        try {
            const lastChecked = localStorage.getItem(`${LAST_CHECKED_KEY}_${currentAccount.address}`)
            const lastCheckedTime = lastChecked
                ? parseInt(lastChecked)
                : Date.now() - 7 * 24 * 60 * 60 * 1000 // Last 7 days on first load

            log("Last checked time:", new Date(lastCheckedTime).toISOString())

            // Query events from the contract
            const eventsResponse = await suiClient.queryEvents({
                query: {
                    MoveModule: {
                        package: REGISTRY_PACKAGE_ID,
                        module: "hadatha_contract"
                    }
                },
                limit: 50,
                order: "descending"
            })

            log("Fetched events:", eventsResponse.data.length)

            if (eventsResponse.data.length === 0) {
                log("No events found")
                localStorage.setItem(`${LAST_CHECKED_KEY}_${currentAccount.address}`, Date.now().toString())
                setIsLoading(false)
                return
            }

            const newNotifications: Notification[] = []
            const existingIds = new Set(notifications.map(n => n.id))

            // Process each event
            for (const event of eventsResponse.data) {
                try {
                    const eventTime = parseInt(event.timestampMs || "0")

                    // Skip if we've already seen this event
                    const notifId = `${event.id.txDigest}_${event.id.eventSeq}`
                    if (existingIds.has(notifId)) {
                        continue
                    }

                    // Only process events newer than last check
                    if (eventTime <= lastCheckedTime) {
                        log("Skipping old event:", eventTime)
                        continue
                    }

                    const eventType = event.type.split("::").pop() || ""
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const parsedFields = event.parsedJson as any

                    log("Processing event:", eventType, parsedFields)

                    switch (eventType) {
                        case "EventCreated": {
                            if (parsedFields.creator === currentAccount.address) {
                                // Decode the title if it's a byte array
                                const eventTitle = parsedFields.title
                                    ? decodeBytes(parsedFields.title)
                                    : 'Untitled Event'

                                newNotifications.push({
                                    id: notifId,
                                    title: "Event Created Successfully",
                                    description: `Your event "${eventTitle}" has been created.`,
                                    type: NotificationType.SUCCESS,
                                    timestamp: eventTime,
                                    unread: true,
                                    eventType: "EventCreated",
                                    eventId: parsedFields.event_id,
                                })
                                log("Added EventCreated notification for:", eventTitle)
                            }
                            break
                        }

                        case "EventRegistered": {
                            // For attendee
                            if (parsedFields.attendee === currentAccount.address) {
                                newNotifications.push({
                                    id: notifId,
                                    title: "Registration Successful",
                                    description: "You've successfully registered for an event.",
                                    type: NotificationType.SUCCESS,
                                    timestamp: eventTime,
                                    unread: true,
                                    eventType: "EventRegistered",
                                    eventId: parsedFields.event_id,
                                })
                                log("Added EventRegistered notification for attendee")
                            }

                            // For organizer - check event ownership
                            try {
                                const eventObject = await suiClient.getObject({
                                    id: parsedFields.event_id,
                                    options: {
                                        showOwner: true,
                                        showContent: true
                                    },
                                })

                                if (eventObject.data?.owner &&
                                    eventObject.data.owner &&
                                    typeof eventObject.data.owner === 'object' &&
                                    'AddressOwner' in eventObject.data.owner &&
                                    eventObject.data.owner.AddressOwner === currentAccount.address) {

                                    // Try to get event name from content
                                    let eventName = "your event"
                                    if (eventObject.data.content && 'fields' in eventObject.data.content) {
                                        const fields = eventObject.data.content.fields as any
                                        if (fields.title) {
                                            eventName = decodeBytes(fields.title)
                                        }
                                    }

                                    newNotifications.push({
                                        id: `${notifId}_organizer`,
                                        title: "New Event Registration",
                                        description: `Someone registered for ${eventName}.`,
                                        type: NotificationType.INFO,
                                        timestamp: eventTime,
                                        unread: true,
                                        eventType: "EventRegistered",
                                        eventId: parsedFields.event_id,
                                    })
                                    log("Added EventRegistered notification for organizer")
                                }
                            } catch (err) {
                                log("Error checking event ownership:", err)
                            }
                            break
                        }

                        case "EventCheckedIn": {
                            if (parsedFields.attendee === currentAccount.address) {
                                // Try to get event name
                                let eventName = "the event"
                                try {
                                    const eventObject = await suiClient.getObject({
                                        id: parsedFields.event_id,
                                        options: { showContent: true },
                                    })
                                    if (eventObject.data?.content && 'fields' in eventObject.data.content) {
                                        const fields = eventObject.data.content.fields as any
                                        if (fields.title) {
                                            eventName = decodeBytes(fields.title)
                                        }
                                    }
                                } catch (err) {
                                    log("Error fetching event name:", err)
                                }

                                newNotifications.push({
                                    id: notifId,
                                    title: "Checked In Successfully",
                                    description: `You've been checked in to ${eventName}.`,
                                    type: NotificationType.SUCCESS,
                                    timestamp: eventTime,
                                    unread: true,
                                    eventType: "EventCheckedIn",
                                    eventId: parsedFields.event_id,
                                })
                                log("Added EventCheckedIn notification")
                            }
                            break
                        }

                        case "AccountCreated": {
                            if (parsedFields.owner === currentAccount.address) {
                                newNotifications.push({
                                    id: notifId,
                                    title: "Account Created",
                                    description: "Your Hadatha account has been created successfully.",
                                    type: NotificationType.SUCCESS,
                                    timestamp: eventTime,
                                    unread: true,
                                    eventType: "AccountCreated",
                                })
                                log("Added AccountCreated notification")
                            }
                            break
                        }

                        case "AttendanceNFTMinted": {
                            if (parsedFields.attendee === currentAccount.address) {
                                // Try to get NFT name
                                let nftName = "Your attendance NFT"
                                try {
                                    const eventObject = await suiClient.getObject({
                                        id: parsedFields.event_id,
                                        options: { showContent: true },
                                    })
                                    if (eventObject.data?.content && 'fields' in eventObject.data.content) {
                                        const fields = eventObject.data.content.fields as any
                                        if (fields.nft_config?.fields?.nft_name) {
                                            nftName = decodeBytes(fields.nft_config.fields.nft_name)
                                        }
                                    }
                                } catch (err) {
                                    log("Error fetching NFT name:", err)
                                }

                                newNotifications.push({
                                    id: notifId,
                                    title: "NFT Minted",
                                    description: `${nftName} has been minted successfully.`,
                                    type: NotificationType.SUCCESS,
                                    timestamp: eventTime,
                                    unread: true,
                                    eventType: "AttendanceNFTMinted",
                                    eventId: parsedFields.event_id,
                                })
                                log("Added AttendanceNFTMinted notification")
                            }
                            break
                        }

                        case "NFTCollectionEnabled": {
                            if (parsedFields.enabled_by === currentAccount.address) {
                                newNotifications.push({
                                    id: notifId,
                                    title: "NFT Collection Enabled",
                                    description: "NFT collection has been enabled for your event.",
                                    type: NotificationType.INFO,
                                    timestamp: eventTime,
                                    unread: true,
                                    eventType: "NFTCollectionEnabled",
                                    eventId: parsedFields.event_id,
                                })
                                log("Added NFTCollectionEnabled notification")
                            }
                            break
                        }

                        default:
                            log("Unknown event type:", eventType)
                    }
                } catch (eventError) {
                    console.error("Error processing event:", eventError)
                }
            }

            log("New notifications created:", newNotifications.length)

            if (newNotifications.length > 0) {
                // Merge with existing notifications
                const allNotifications = [...newNotifications, ...notifications]
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .slice(0, 50) // Keep only last 50 notifications

                saveNotifications(allNotifications)
            }

            // Update last checked time
            localStorage.setItem(`${LAST_CHECKED_KEY}_${currentAccount.address}`, Date.now().toString())

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Failed to fetch events:", error)
            setError(error?.message || "Failed to fetch notifications")
        } finally {
            setIsLoading(false)
        }
    }, [currentAccount, suiClient, notifications, saveNotifications])

    // Poll for new events every 30 seconds
    useEffect(() => {
        if (!currentAccount) return

        // Initial fetch
        fetchNewEvents()

        // Poll every 30 seconds
        const interval = setInterval(() => {
            log("Polling for new events...")
            fetchNewEvents()
        }, 30000)

        return () => clearInterval(interval)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentAccount?.address]) // Only re-run when account changes

    // Mark notification as read
    const markAsRead = useCallback((notificationId: string) => {
        const updated = notifications.map(n =>
            n.id === notificationId ? { ...n, unread: false } : n
        )
        saveNotifications(updated)
    }, [notifications, saveNotifications])

    // Mark all as read
    const markAllAsRead = useCallback(() => {
        const updated = notifications.map(n => ({ ...n, unread: false }))
        saveNotifications(updated)
    }, [notifications, saveNotifications])

    // Delete notification
    const deleteNotification = useCallback((notificationId: string) => {
        const updated = notifications.filter(n => n.id !== notificationId)
        saveNotifications(updated)
    }, [notifications, saveNotifications])

    // Clear all notifications
    const clearAll = useCallback(() => {
        saveNotifications([])
    }, [saveNotifications])

    // Get icon for notification
    const getNotificationIcon = useCallback((notification: Notification) => {
        switch (notification.eventType) {
            case "EventCreated":
                return <Calendar className="w-4 h-4 text-blue-400" />
            case "EventRegistered":
                return <CheckCircle2 className="w-4 h-4 text-green-400" />
            case "EventCheckedIn":
                return <CheckCircle2 className="w-4 h-4 text-green-400" />
            case "AccountCreated":
                return <User className="w-4 h-4 text-green-400" />
            case "AttendanceNFTMinted":
                return <CheckCircle2 className="w-4 h-4 text-purple-400" />
            case "NFTCollectionEnabled":
                return <Bell className="w-4 h-4 text-blue-400" />
            default:
                if (notification.type === NotificationType.ERROR) {
                    return <AlertCircle className="w-4 h-4 text-red-400" />
                }
                return <CheckCircle2 className="w-4 h-4 text-green-400" />
        }
    }, [])

    // Get time ago string
    const getTimeAgo = useCallback((timestamp: number) => {
        const now = Date.now()
        const diff = now - timestamp
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (minutes < 1) return "Just now"
        if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
        return `${days} day${days > 1 ? 's' : ''} ago`
    }, [])

    const unreadCount = notifications.filter(n => n.unread).length

    return {
        notifications,
        unreadCount,
        isLoading,
        error,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        getNotificationIcon,
        getTimeAgo,
        refresh: fetchNewEvents,
    }
}