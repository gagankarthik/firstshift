"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  User,
  AlertCircle,
  X,
  Check,
  Trash2,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export type NotificationType =
  | "shift_assigned"
  | "shift_changed"
  | "shift_cancelled"
  | "time_off_approved"
  | "time_off_denied"
  | "schedule_published"
  | "shift_reminder"
  | "shift_trade_request"
  | "shift_trade_approved";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  action_url?: string;
  metadata?: Record<string, any>;
};

interface NotificationsPanelProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

const NOTIFICATION_CONFIG: Record<
  NotificationType,
  { icon: React.ElementType; color: string; bgColor: string }
> = {
  shift_assigned: {
    icon: Calendar,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  shift_changed: {
    icon: Clock,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  shift_cancelled: {
    icon: X,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  time_off_approved: {
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  time_off_denied: {
    icon: X,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  schedule_published: {
    icon: Calendar,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  shift_reminder: {
    icon: Bell,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  shift_trade_request: {
    icon: User,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
  shift_trade_approved: {
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
};

export function NotificationsPanel({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
}: NotificationsPanelProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1"
              >
                <Badge className="h-5 min-w-5 flex items-center justify-center p-0 px-1 bg-gradient-to-r from-primary to-secondary">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md p-0 bg-background/95 backdrop-blur-xl">
        <SheetHeader className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="outline">{unreadCount} new</Badge>
              )}
            </SheetTitle>
            <div className="flex gap-2">
              {notifications.length > 0 && (
                <>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onMarkAllAsRead}
                      className="text-xs"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Mark all read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearAll}
                    className="text-xs text-destructive"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Clear all
                  </Button>
                </>
              )}
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="p-4 space-y-2">
            {notifications.length === 0 ? (
              <div className="text-center py-16">
                <Bell className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-1">
                  No notifications
                </h3>
                <p className="text-sm text-muted-foreground">
                  You're all caught up!
                </p>
              </div>
            ) : (
              notifications.map((notification, index) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  index={index}
                  onMarkAsRead={onMarkAsRead}
                  onDelete={onDelete}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function NotificationCard({
  notification,
  index,
  onMarkAsRead,
  onDelete,
}: {
  notification: Notification;
  index: number;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const config = NOTIFICATION_CONFIG[notification.type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className={cn(
        "group relative p-4 rounded-xl border transition-all",
        notification.read
          ? "bg-background/50 border-border/30"
          : "bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20 shadow-sm"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`p-2 rounded-lg ${config.bgColor} shrink-0`}>
          <Icon className={`h-4 w-4 ${config.color}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4
              className={cn(
                "font-semibold text-sm",
                notification.read
                  ? "text-muted-foreground"
                  : "text-foreground"
              )}
            >
              {notification.title}
            </h4>
            {!notification.read && (
              <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1" />
            )}
          </div>

          <p
            className={cn(
              "text-sm mb-2",
              notification.read
                ? "text-muted-foreground/70"
                : "text-foreground/80"
            )}
          >
            {notification.message}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.created_at), {
                addSuffix: true,
              })}
            </span>

            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkAsRead(notification.id)}
                  className="h-7 px-2 text-xs"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Mark read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(notification.id)}
                className="h-7 px-2 text-xs text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
