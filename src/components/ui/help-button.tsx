"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { HelpCircle, BookOpen, ExternalLink, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type HelpLink = {
  title: string;
  href: string;
  description?: string;
  external?: boolean;
};

type HelpButtonProps = {
  tooltip?: string;
  links?: HelpLink[];
  variant?: "icon" | "button" | "text";
  size?: "sm" | "md" | "lg";
  className?: string;
  placement?: "top" | "bottom" | "left" | "right";
};

const defaultLinks: HelpLink[] = [
  {
    title: "Documentation",
    href: "/docs",
    description: "Browse all guides and tutorials",
  },
  {
    title: "Getting Started",
    href: "/docs/getting-started/quick-start",
    description: "5-minute setup guide",
  },
  {
    title: "Contact Support",
    href: "/help",
    description: "Get direct help from our team",
  },
];

export function HelpButton({
  tooltip = "Get help and documentation",
  links = defaultLinks,
  variant = "icon",
  size = "md",
  className,
  placement = "bottom",
}: HelpButtonProps) {
  const [open, setOpen] = React.useState(false);

  const buttonSizes = {
    sm: "h-7 w-7",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const renderButton = () => {
    const baseClasses = cn(
      "transition-colors duration-200",
      variant === "icon" && buttonSizes[size],
      className
    );

    const content = (
      <>
        <HelpCircle className={iconSizes[size]} />
        {variant === "button" && <span className="ml-2">Help</span>}
        {variant === "text" && <span className="ml-1">Help</span>}
      </>
    );

    if (variant === "icon") {
      return (
        <Button
          variant="ghost"
          size="sm"
          className={baseClasses}
          onClick={() => setOpen(!open)}
        >
          {content}
        </Button>
      );
    }

    return (
      <Button
        variant={variant === "text" ? "ghost" : "outline"}
        size={size === "sm" ? "sm" : "default"}
        className={baseClasses}
        onClick={() => setOpen(!open)}
      >
        {content}
      </Button>
    );
  };

  if (links.length === 1) {
    // Single link - direct navigation with tooltip
    const link = links[0];
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              asChild
              variant={variant === "icon" ? "ghost" : variant === "text" ? "ghost" : "outline"}
              size={variant === "icon" ? "sm" : size === "sm" ? "sm" : "default"}
              className={cn(
                "transition-colors duration-200",
                variant === "icon" && buttonSizes[size],
                className
              )}
            >
              <Link href={link.href} target={link.external ? "_blank" : undefined}>
                <HelpCircle className={iconSizes[size]} />
                {variant === "button" && <span className="ml-2">Help</span>}
                {variant === "text" && <span className="ml-1">Help</span>}
                {link.external && <ExternalLink className="ml-1 h-3 w-3" />}
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent side={placement}>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Multiple links - dropdown menu
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              {renderButton()}
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side={placement}>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent
        align={placement === "left" ? "start" : placement === "right" ? "end" : "center"}
        side={placement === "top" || placement === "bottom" ? placement : "bottom"}
        className="w-56"
      >
        {links.map((link, index) => (
          <React.Fragment key={link.href}>
            <DropdownMenuItem asChild>
              <Link
                href={link.href}
                target={link.external ? "_blank" : undefined}
                className="flex items-center gap-3 p-3"
              >
                <div className="flex items-center gap-2 flex-1">
                  {link.external ? (
                    <ExternalLink className="h-4 w-4 text-gray-500" />
                  ) : (
                    <BookOpen className="h-4 w-4 text-gray-500" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">{link.title}</div>
                    {link.description && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        {link.description}
                      </div>
                    )}
                  </div>
                </div>
                <ArrowRight className="h-3 w-3 text-gray-400" />
              </Link>
            </DropdownMenuItem>
            {index < links.length - 1 && index === 1 && <DropdownMenuSeparator />}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Specialized help buttons for common scenarios
export function ScheduleHelpButton(props: Partial<HelpButtonProps>) {
  return (
    <HelpButton
      tooltip="Get help with scheduling"
      links={[
        {
          title: "Scheduling Guide",
          href: "/docs/scheduling",
          description: "Learn drag & drop and features",
        },
        {
          title: "Creating Shifts",
          href: "/docs/scheduling#creating-shifts",
          description: "Step-by-step shift creation",
        },
        {
          title: "Handling Conflicts",
          href: "/docs/scheduling#conflicts",
          description: "Resolve scheduling conflicts",
        },
        {
          title: "Contact Support",
          href: "/help",
          description: "Get direct help",
        },
      ]}
      {...props}
    />
  );
}

export function EmployeeHelpButton(props: Partial<HelpButtonProps>) {
  return (
    <HelpButton
      tooltip="Get help with employee management"
      links={[
        {
          title: "Employee Management",
          href: "/docs/employees",
          description: "Complete employee guide",
        },
        {
          title: "Adding Employees",
          href: "/docs/employees#adding-employees",
          description: "How to add team members",
        },
        {
          title: "Join Codes",
          href: "/docs/admin/join-codes",
          description: "Invite employees to join",
        },
        {
          title: "Contact Support",
          href: "/help",
          description: "Get direct help",
        },
      ]}
      {...props}
    />
  );
}

export function AvailabilityHelpButton(props: Partial<HelpButtonProps>) {
  return (
    <HelpButton
      tooltip="Get help with availability"
      links={[
        {
          title: "Availability Guide",
          href: "/docs/availability",
          description: "Complete availability guide",
        },
        {
          title: "Setting Your Availability",
          href: "/docs/availability#setting-availability",
          description: "How to set your work hours",
        },
        {
          title: "Contact Support",
          href: "/help",
          description: "Get direct help",
        },
      ]}
      {...props}
    />
  );
}

export function TimeOffHelpButton(props: Partial<HelpButtonProps>) {
  return (
    <HelpButton
      tooltip="Get help with time off"
      links={[
        {
          title: "Time Off Guide",
          href: "/docs/time-off",
          description: "Complete time off guide",
        },
        {
          title: "Requesting Time Off",
          href: "/docs/time-off#requesting",
          description: "How to submit requests",
        },
        {
          title: "Approving Requests",
          href: "/docs/time-off#approving",
          description: "For managers and admins",
        },
        {
          title: "Contact Support",
          href: "/help",
          description: "Get direct help",
        },
      ]}
      {...props}
    />
  );
}