"use client"

import { useState } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table"
import { Plus, Trash2, Edit } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { createPelatihan, deletePelatihan } from "@/server/actions/pelatihan"

interface Pelatihan {
  id: string
  kode: string
  nama: string
  deskripsi: string | null
  _count: {
    jadwals: number
  }
}

interface PelatihanClientProps {
  data: Pelatihan[]
}

export function PelatihanClient({ data }: PelatihanClientProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const columns: ColumnDef<Pelatihan>[] = [
    {
      accessorKey: "kode",
      header: "Kode",
    },
    {
      accessorKey: "nama",
      header: "Nama Pelatihan",
    },
    {
      accessorKey: "deskripsi",
      header: "Deskripsi",
      cell: ({ row }) => {
        const desc = row.getValue("deskripsi") as string
        return desc ? (desc.length > 50 ? desc.substring(0, 50) + "..." : desc) : "-"
      }
    },
    {
      id: "jumlah_jadwal",
      header: "Total Jadwal",
      cell: ({ row }) => <span className="font-medium bg-slate-100 px-2 py-1 rounded-md">{row.original._count.jadwals}</span>,
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const id = row.original.id
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-blue-500 hover:text-blue-700">
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-red-500 hover:text-red-700"
              onClick={async () => {
                if (confirm("Yakin ingin menghapus?")) {
                  await deletePelatihan(id)
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  async function onSubmit(formData: FormData) {
    setLoading(true)
    setError("")
    
    const res = await createPelatihan(formData)
    
    if (res.success) {
      setIsOpen(false)
    } else {
      setError(res.error || "Gagal menyimpan")
    }
    
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manajemen Pelatihan</h2>
          <p className="text-muted-foreground">Tambah, ubah, dan hapus data program pelatihan.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 gap-1">
              <Plus className="h-4 w-4" /> Tambah Pelatihan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Pelatihan Baru</DialogTitle>
              <DialogDescription>
                Masukkan detail pelatihan yang akan diselenggarakan. Pastikan kode unik.
              </DialogDescription>
            </DialogHeader>
            <form action={onSubmit} className="space-y-4 mt-4">
              {error && <div className="p-3 bg-red-100 text-red-600 rounded-md text-sm">{error}</div>}
              <div className="space-y-2">
                <Label htmlFor="kode">Kode Pelatihan *</Label>
                <Input id="kode" name="kode" required placeholder="Contoh: WEB-DEV-001" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Pelatihan *</Label>
                <Input id="nama" name="nama" required placeholder="Judul program pelatihan" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deskripsi">Deskripsi</Label>
                <Input id="deskripsi" name="deskripsi" placeholder="Penjelasan singkat" />
              </div>
              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={loading} className="bg-blue-600">
                  {loading ? "Menyimpan..." : "Simpan Data"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-slate-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Belum ada data pelatihan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Sebelumnya
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Selanjutnya
        </Button>
      </div>
    </div>
  )
}
