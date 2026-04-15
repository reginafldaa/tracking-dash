"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
<<<<<<< HEAD
    <div className="relative w-full overflow-x-auto">
      <table
=======
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
>>>>>>> ec38d6a1028d8b82d170b00c5af36c67771151b2
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
<<<<<<< HEAD
    <thead className={cn("[&_tr]:border-b", className)} {...props} />
=======
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
>>>>>>> ec38d6a1028d8b82d170b00c5af36c67771151b2
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
<<<<<<< HEAD
    <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
=======
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
>>>>>>> ec38d6a1028d8b82d170b00c5af36c67771151b2
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
<<<<<<< HEAD
=======
      data-slot="table-footer"
>>>>>>> ec38d6a1028d8b82d170b00c5af36c67771151b2
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
<<<<<<< HEAD
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
=======
      data-slot="table-row"
      className={cn(
        "border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
>>>>>>> ec38d6a1028d8b82d170b00c5af36c67771151b2
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
<<<<<<< HEAD
      className={cn(
        "h-10 px-2 text-left align-middle font-medium text-foreground [&:has([role=checkbox])]:pr-0",
=======
      data-slot="table-head"
      className={cn(
        "h-12 px-3 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0",
>>>>>>> ec38d6a1028d8b82d170b00c5af36c67771151b2
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
<<<<<<< HEAD
      className={cn("p-2 align-middle [&:has([role=checkbox])]:pr-0", className)}
=======
      data-slot="table-cell"
      className={cn(
        "p-3 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        className
      )}
>>>>>>> ec38d6a1028d8b82d170b00c5af36c67771151b2
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
<<<<<<< HEAD
=======
      data-slot="table-caption"
>>>>>>> ec38d6a1028d8b82d170b00c5af36c67771151b2
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
