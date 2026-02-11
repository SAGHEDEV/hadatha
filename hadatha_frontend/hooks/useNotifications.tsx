/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useCallback } from "react"
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit"
import { Notification, NotificationType } from "@/types/notification"
import { CheckCircle2, AlertCircle, Calendar, User, Bell, Edit } from "lucide-react"
import { REGISTRY_PACKAGE_ID } from "@/lib/constant"

const NOTIFICATION_STORAGE_KEY = "hadatha_notifications"
const LAST_CHECKED_KEY = "hadatha_last_checked"

// Debug flag - set to true for console logs
const DEBUG = true

const log = (...args: any[]) => {
    if (DEBUG) console.log("[Notifications]", ...args)
}

// Helper function to decode byte array to string
const decodeBytes = (bytes: number[] | string): string => {
    if (typeof bytes === 'string') return bytes
    if (!Array.isArray(bytes)) return ''

    try {
        return new TextDecoder().decode(new Uint8Array(bytes))
    } catch (error) {
        console.error("Failed to decode bytes:", error)
        return bytes.toString()
    }
}

// Helper to check if user is event organizer or co-organizer
const isUserOrganizer = async (
    suiClient: any,
    eventId: string,
    userAddress: string
): Promise<boolean> => {
    try {
        const eventObject = await suiClient.getObject({
            id: eventId,
            options: {
                showOwner: true,
                showContent: true
            },
        })

        // Check if user is the owner (main organizer)
        if (eventObject.data?.owner &&
            typeof eventObject.data.owner === 'object' &&
            'AddressOwner' in eventObject.data.owner &&
            eventObject.data.owner.AddressOwner === userAddress) {
            return true
        }

        // Check if user is a co-organizer
        if (eventObject.data?.content && 'fields' in eventObject.data.content) {
            const fields = eventObject.data.content.fields as any
            if (fields.organizers && Array.isArray(fields.organizers)) {
                return fields.organizers.some((org: any) =>
                    org === userAddress || org.fields?.address === userAddress
                )
            }
        }

        return false
    } catch (error) {
        log("Error checking organizer status:", error)
        return false
    }
}

// Helper to check if user is registered for an event
const isUserRegistered = async (
    suiClient: any,
    eventId: string,
    userAddress: string
): Promise<boolean> => {
    try {
        const eventObject = await suiClient.getObject({
            id: eventId,
            options: { showContent: true },
        })

        if (eventObject.data?.content && 'fields' in eventObject.data.content) {
            const fields = eventObject.data.content.fields as any

            // Check attendees list
            if (fields.attendees && Array.isArray(fields.attendees)) {
                return fields.attendees.some((attendee: any) =>
                    attendee === userAddress || attendee.fields?.address === userAddress
                )
            }
        }

        return false
    } catch (error) {
        log("Error checking registration status:", error)
        return false
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
                : Date.now() - 7 * 24 * 60 * 60 * 1000

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
                    const notifId = `${event.id.txDigest}_${event.id.eventSeq}`

                    // Skip if already seen or old
                    if (existingIds.has(notifId) || eventTime <= lastCheckedTime) {
                        continue
                    }

                    const eventType = event.type.split("::").pop() || ""
                    const parsedFields = event.parsedJson as any

                    log("Processing event:", eventType, parsedFields)

                    switch (eventType) {
                        case "EventCreated": {
                            // ONLY show to the creator
                            if (parsedFields.creator === currentAccount.address) {
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
                                log("Added EventCreated notification for creator")
                            }
                            break
                        }

                        case "EventUpdated": {
                            // Show to organizers AND registered attendees
                            const isOrganizer = await isUserOrganizer(
                                suiClient,
                                parsedFields.event_id,
                                currentAccount.address
                            )
                            const isRegistered = await isUserRegistered(
                                suiClient,
                                parsedFields.event_id,
                                currentAccount.address
                            )

                            if (isOrganizer || isRegistered) {
                                let eventTitle = "Event"
                                try {
                                    const eventObject = await suiClient.getObject({
                                        id: parsedFields.event_id,
                                        options: { showContent: true },
                                    })
                                    if (eventObject.data?.content && 'fields' in eventObject.data.content) {
                                        const fields = eventObject.data.content.fields as any
                                        if (fields.title) {
                                            eventTitle = decodeBytes(fields.title)
                                        }
                                    }
                                } catch (err) {
                                    log("Error fetching event title:", err)
                                }

                                newNotifications.push({
                                    id: notifId,
                                    title: isOrganizer ? "Event Updated" : "Event You Registered For Was Updated",
                                    description: isOrganizer
                                        ? `Your event "${eventTitle}" has been updated.`
                                        : `"${eventTitle}" has been updated. Check the latest details.`,
                                    type: NotificationType.INFO,
                                    timestamp: eventTime,
                                    unread: true,
                                    eventType: "EventUpdated",
                                    eventId: parsedFields.event_id,
                                })
                                log("Added EventUpdated notification for", isOrganizer ? "organizer" : "attendee")
                            }
                            break
                        }

                        case "EventRegistered": {
                            // Show to the attendee who registered
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

                            // Show to event organizers (not the attendee)
                            const isOrganizer = await isUserOrganizer(
                                suiClient,
                                parsedFields.event_id,
                                currentAccount.address
                            )

                            if (isOrganizer && parsedFields.attendee !== currentAccount.address) {
                                let eventName = "your event"
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
                                    id: `${notifId}_organizer`,
                                    title: "New Registration",
                                    description: `Someone registered for "${eventName}".`,
                                    type: NotificationType.INFO,
                                    timestamp: eventTime,
                                    unread: true,
                                    eventType: "EventRegistered",
                                    eventId: parsedFields.event_id,
                                })
                                log("Added EventRegistered notification for organizer")
                            }
                            break
                        }

                        case "EventCheckedIn": {
                            // ONLY show to the attendee who checked in
                            if (parsedFields.attendee === currentAccount.address) {
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
                                    description: `You've been checked in to "${eventName}".`,
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
                            // ONLY show to the account owner
                            if (parsedFields.owner === currentAccount.address) {
                                newNotifications.push({
                                    id: notifId,
                                    title: "Welcome to Hadatha!",
                                    description: "Your account has been created successfully.",
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
                            // ONLY show to the attendee who received the NFT
                            if (parsedFields.attendee === currentAccount.address) {
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
                                    title: "NFT Minted! 🎉",
                                    description: `${nftName} has been minted to your wallet.`,
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
                            // ONLY show to the organizer who enabled it
                            if (parsedFields.enabled_by === currentAccount.address) {
                                newNotifications.push({
                                    id: notifId,
                                    title: "NFT Collection Enabled",
                                    description: "Attendees can now receive NFTs for your event.",
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

            log("New personalized notifications created:", newNotifications.length)

            if (newNotifications.length > 0) {
                const allNotifications = [...newNotifications, ...notifications]
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .slice(0, 50)

                saveNotifications(allNotifications)
            }

            localStorage.setItem(`${LAST_CHECKED_KEY}_${currentAccount.address}`, Date.now().toString())

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

        fetchNewEvents()
        const interval = setInterval(() => {
            log("Polling for new events...")
            fetchNewEvents()
        }, 30000)

        return () => clearInterval(interval)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentAccount?.address])

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
            case "EventUpdated":
                return <Edit className="w-4 h-4 text-yellow-400" />
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