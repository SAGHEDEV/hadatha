"use client"

import { useState, useEffect, useCallback } from "react"
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit"
import { Notification, NotificationType } from "@/types/notification"
import { CheckCircle2, AlertCircle, Calendar, User, Bell } from "lucide-react"

const NOTIFICATION_STORAGE_KEY = "hadatha_notifications"
const LAST_CHECKED_KEY = "hadatha_last_checked"
const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID || ""

export const useNotifications = () => {
    const currentAccount = useCurrentAccount()
    const suiClient = useSuiClient()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isLoading, setIsLoading] = useState(false)

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
                setNotifications(parsed)
            } catch (error) {
                console.error("Failed to parse notifications:", error)
            }
        }
    }, [currentAccount])

    // Save notifications to localStorage
    const saveNotifications = useCallback((notifs: Notification[]) => {
        if (!currentAccount) return
        localStorage.setItem(`${NOTIFICATION_STORAGE_KEY}_${currentAccount.address}`, JSON.stringify(notifs))
        setNotifications(notifs)
    }, [currentAccount])

    // Fetch new events from the blockchain
    const fetchNewEvents = useCallback(async () => {
        if (!currentAccount || !PACKAGE_ID) return

        setIsLoading(true)
        try {
            const lastChecked = localStorage.getItem(`${LAST_CHECKED_KEY}_${currentAccount.address}`)
            const lastCheckedTime = lastChecked ? parseInt(lastChecked) : Date.now() - 24 * 60 * 60 * 1000 // Last 24 hours

            // Query events from the contract
            const events = await suiClient.queryEvents({
                query: {
                    MoveModule: {
                        package: PACKAGE_ID,
                        module: "hadatha_contract"
                    }
                },
                limit: 50,
                order: "descending"
            })

            const newNotifications: Notification[] = []

            // Process each event
            for (const event of events.data) {
                const eventTime = parseInt(event.timestampMs || "0")
                if (eventTime <= lastCheckedTime) continue

                const eventType = event.type.split("::").pop() || ""
                const parsedFields = event.parsedJson as any

                let notification: Notification | null = null

                switch (eventType) {
                    case "EventCreated":
                        if (parsedFields.creator === currentAccount.address) {
                            notification = {
                                id: event.id.txDigest + "_" + event.id.eventSeq,
                                title: "Event Created Successfully",
                                description: `Your event has been created successfully.`,
                                type: NotificationType.SUCCESS,
                                timestamp: eventTime,
                                unread: true,
                                eventType: "EventCreated",
                                eventId: parsedFields.event_id,
                            }
                        }
                        break

                    case "EventRegistered":
                        if (parsedFields.attendee === currentAccount.address) {
                            notification = {
                                id: event.id.txDigest + "_" + event.id.eventSeq,
                                title: "Registration Successful",
                                description: "You've successfully registered for an event.",
                                type: NotificationType.SUCCESS,
                                timestamp: eventTime,
                                unread: true,
                                eventType: "EventRegistered",
                                eventId: parsedFields.event_id,
                            }
                        }
                        break

                    case "EventCheckedIn":
                        if (parsedFields.attendee === currentAccount.address) {
                            notification = {
                                id: event.id.txDigest + "_" + event.id.eventSeq,
                                title: "Checked In Successfully",
                                description: "You've been checked in to the event.",
                                type: NotificationType.SUCCESS,
                                timestamp: eventTime,
                                unread: true,
                                eventType: "EventCheckedIn",
                                eventId: parsedFields.event_id,
                            }
                        }
                        break

                    case "EventUpdated":
                        // Check if user is registered for this event (would need additional query)
                        // For now, we'll skip this or you can implement a more complex check
                        break

                    case "AccountCreated":
                        if (parsedFields.owner === currentAccount.address) {
                            notification = {
                                id: event.id.txDigest + "_" + event.id.eventSeq,
                                title: "Account Created",
                                description: "Your Hadatha account has been created successfully.",
                                type: NotificationType.SUCCESS,
                                timestamp: eventTime,
                                unread: true,
                                eventType: "AccountCreated",
                            }
                        }
                        break

                    case "AttendanceNFTMinted":
                        if (parsedFields.attendee === currentAccount.address) {
                            notification = {
                                id: event.id.txDigest + "_" + event.id.eventSeq,
                                title: "NFT Minted",
                                description: "Your attendance NFT has been minted successfully.",
                                type: NotificationType.SUCCESS,
                                timestamp: eventTime,
                                unread: true,
                                eventType: "AttendanceNFTMinted",
                                eventId: parsedFields.event_id,
                            }
                        }
                        break

                    case "NFTCollectionEnabled":
                        // This could be for organizers
                        if (parsedFields.enabled_by === currentAccount.address) {
                            notification = {
                                id: event.id.txDigest + "_" + event.id.eventSeq,
                                title: "NFT Collection Enabled",
                                description: "NFT collection has been enabled for your event.",
                                type: NotificationType.INFO,
                                timestamp: eventTime,
                                unread: true,
                                eventType: "NFTCollectionEnabled",
                                eventId: parsedFields.event_id,
                            }
                        }
                        break
                }

                if (notification) {
                    newNotifications.push(notification)
                }
            }

            // Merge with existing notifications (avoid duplicates)
            const existingNotifs = notifications.filter(n =>
                !newNotifications.some(nn => nn.id === n.id)
            )
            const allNotifications = [...newNotifications, ...existingNotifs]
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, 50) // Keep only last 50 notifications

            saveNotifications(allNotifications)
            localStorage.setItem(`${LAST_CHECKED_KEY}_${currentAccount.address}`, Date.now().toString())
        } catch (error) {
            console.error("Failed to fetch events:", error)
        } finally {
            setIsLoading(false)
        }
    }, [currentAccount, suiClient, notifications, saveNotifications])

    // Poll for new events every 30 seconds
    useEffect(() => {
        if (!currentAccount) return

        fetchNewEvents()
        const interval = setInterval(fetchNewEvents, 30000)
        return () => clearInterval(interval)
    }, [currentAccount, fetchNewEvents])

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
        markAsRead,
        markAllAsRead,
        getNotificationIcon,
        getTimeAgo,
        refresh: fetchNewEvents,
    }
}
