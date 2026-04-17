"use client"

import { useState, useEffect, useCallback } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table"
import {
  Download,
  Filter,
  Search,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  getAbsensiData,
  getPelatihanList,
  getJadwalList,
  getAbsensiStatistics,
} from "@/server/actions/absensi"

interface StatCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  color: string
}

interface AbsensiRecord {
  id: string
  pendaftaranId: string
  checkIn: Date | null
  checkOut: Date | null
  createdAt: Date
  pendaftaran: {
    user: {
      name: string | null
    }
    jadwal: {
      date: Date
      location: string | null
      pelatihan: {
        name: string
      }
    }
  }
}

interface Pelatihan {
  id: string
  name: string
}

interface Jadwal {
  id: string
  date: Date
  location: string | null
  pelatihan: {
    name: string
  }
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
      </div>
    </div>
  )
}

export function AbsensiClient() {
  const [data, setData] = useState<AbsensiRecord[]>([])
  const [pelatihans, setPelatihans] = useState<Pelatihan[]>([])
  const [jadwals, setJadwals] = useState<Jadwal[]>([])
  const [stats, setStats] = useState({
    total: 0,
    hadir: 0,
    tidakHadir: 0,
    belum: 0,
    persentaseKehadiran: 0,
  })
  const [loading, setLoading] = useState(true)

  // Filters
  const [searchNama, setSearchNama] = useState("")
  const [selectedPelatihan, setSelectedPelatihan] = useState("all")
  const [selectedJadwal, setSelectedJadwal] = useState("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // Initialize and load data
  const loadInitialData = useCallback(async () => {
    setLoading(true)
    try {
      const [pelatihanRes, jadwalRes, absensiRes, statsRes] = await Promise.all([
        getPelatihanList(),
        getJadwalList(),
        getAbsensiData(),
        getAbsensiStatistics(),
      ])

      if (pelatihanRes.success) setPelatihans(pelatihanRes.data)
      if (jadwalRes.success) setJadwals(jadwalRes.data)
      if (absensiRes.success) setData(absensiRes.data)
      setStats(statsRes)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadJadwals = useCallback(async (pelatihanId?: string) => {
    try {
      const jadwalRes = await getJadwalList(pelatihanId)
      if (jadwalRes.success) {
        setJadwals(jadwalRes.data)
      }
    } catch (error) {
      console.error("Error loading jadwal list:", error)
    }
  }, [])

  // Apply filters
  const applyFilters = useCallback(async () => {
    setLoading(true)
    try {
      const filters = {
        pelatihanId: selectedPelatihan && selectedPelatihan !== "all" ? selectedPelatihan : undefined,
        jadwalId: selectedJadwal && selectedJadwal !== "all" ? selectedJadwal : undefined,
        searchNama: searchNama || undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      }

      const [absensiRes, statsRes] = await Promise.all([
        getAbsensiData(filters),
        getAbsensiStatistics(filters),
      ])

      if (absensiRes.success) setData(absensiRes.data)
      setStats(statsRes)
    } catch (error) {
      console.error("Error applying filters:", error)
    } finally {
      setLoading(false)
    }
  }, [selectedPelatihan, selectedJadwal, searchNama, startDate, endDate])

  // Load data on component mount
  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  useEffect(() => {
    const pelatihanId =
      selectedPelatihan !== "all" ? selectedPelatihan : undefined

    if (selectedJadwal !== "all") {
      setSelectedJadwal("all")
    }

    loadJadwals(pelatihanId)
  }, [loadJadwals, selectedJadwal, selectedPelatihan])

  const columns: ColumnDef<AbsensiRecord>[] = [
    {
      id: "no",
      header: "No",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "pendaftaran.user.name",
      header: "Nama Peserta",
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.pendaftaran.user.name || "-"}
        </span>
      ),
    },
    {
      accessorKey: "pendaftaran.jadwal.pelatihan.name",
      header: "Pelatihan",
      cell: ({ row }) => <span>{row.original.pendaftaran.jadwal.pelatihan.name}</span>,
    },
    {
      accessorKey: "pendaftaran.jadwal.date",
      header: "Tanggal Jadwal",
      cell: ({ row }) => (
        <span>
          {new Date(row.original.pendaftaran.jadwal.date).toLocaleDateString(
            "id-ID"
          )}
        </span>
      ),
    },
    {
      accessorKey: "checkIn",
      header: "Jam Masuk",
      cell: ({ row }) => (
        <span>
          {row.original.checkIn
            ? new Date(row.original.checkIn).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-"}
        </span>
      ),
    },
    {
      accessorKey: "checkOut",
      header: "Jam Keluar",
      cell: ({ row }) => (
        <span>
          {row.original.checkOut
            ? new Date(row.original.checkOut).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-"}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const hadir = row.original.checkIn && row.original.checkOut
        const tidakHadir = !row.original.checkIn && !row.original.checkOut
        const belum = row.original.checkIn && !row.original.checkOut

        if (hadir) {
          return (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
              <CheckCircle className="h-4 w-4" />
              Hadir
            </span>
          )
        }
        if (tidakHadir) {
          return (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
              <XCircle className="h-4 w-4" />
              Tidak Hadir
            </span>
          )
        }
        if (belum) {
          return (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
              <Clock className="h-4 w-4" />
              Belum Selesai
            </span>
          )
        }
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const exportToCSV = () => {
    if (data.length === 0) {
      alert("Tidak ada data untuk diexport")
      return
    }

    const csv = [
      ["No", "Nama Peserta", "Pelatihan", "Tanggal Jadwal", "Jam Masuk", "Jam Keluar", "Status"],
      ...data.map((row, index) => {
        const hadir = row.checkIn && row.checkOut
        const tidakHadir = !row.checkIn && !row.checkOut
        const status = hadir ? "Hadir" : tidakHadir ? "Tidak Hadir" : "Belum Selesai"

        return [
          index + 1,
          row.pendaftaran.user.name || "-",
          row.pendaftaran.jadwal.pelatihan.name,
          new Date(row.pendaftaran.jadwal.date).toLocaleDateString("id-ID"),
          row.checkIn
            ? new Date(row.checkIn).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-",
          row.checkOut
            ? new Date(row.checkOut).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-",
          status,
        ]
      }),
    ]

    const csvContent = csv.map((row) => row.map(cell => `"${cell}"`).join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `absensi-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manajemen Absensi</h1>
        <p className="text-gray-500">
          Lihat, filter, dan export data kehadiran peserta pelatihan
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Peserta"
          value={stats.total}
          icon={<Users className="h-6 w-6" />}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Hadir"
          value={stats.hadir}
          icon={<CheckCircle className="h-6 w-6" />}
          color="bg-green-100 text-green-600"
        />
        <StatCard
          title="Tidak Hadir"
          value={stats.tidakHadir}
          icon={<XCircle className="h-6 w-6" />}
          color="bg-red-100 text-red-600"
        />
        <StatCard
          title="Belum Selesai"
          value={stats.belum}
          icon={<Clock className="h-6 w-6" />}
          color="bg-yellow-100 text-yellow-600"
        />
        <StatCard
          title="Tingkat Kehadiran"
          value={`${stats.persentaseKehadiran}%`}
          icon={<TrendingUp className="h-6 w-6" />}
          color="bg-purple-100 text-purple-600"
        />
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Filter & Pencarian</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search by Nama */}
          <div>
            <Label htmlFor="search-nama">Cari Nama Peserta</Label>
            <div className="flex gap-2 mt-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="search-nama"
                  placeholder="Ketik nama..."
                  value={searchNama}
                  onChange={(e) => setSearchNama(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Filter by Pelatihan */}
          <div>
            <Label htmlFor="pelatihan">Pelatihan</Label>
            <Select value={selectedPelatihan} onValueChange={setSelectedPelatihan}>
              <SelectTrigger id="pelatihan" className="mt-2">
                <SelectValue placeholder="Pilih pelatihan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Pelatihan</SelectItem>
                {pelatihans.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filter by Jadwal */}
          <div>
            <Label htmlFor="jadwal">Jadwal</Label>
            <Select value={selectedJadwal} onValueChange={setSelectedJadwal}>
              <SelectTrigger id="jadwal" className="mt-2">
                <SelectValue placeholder="Pilih jadwal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jadwal</SelectItem>
                {jadwals.map((j) => (
                  <SelectItem key={j.id} value={j.id}>
                    {j.pelatihan.name} -{" "}
                    {new Date(j.date).toLocaleDateString("id-ID")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start Date */}
          <div>
            <Label htmlFor="start-date">Dari Tanggal</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-2"
            />
          </div>

          {/* End Date */}
          <div>
            <Label htmlFor="end-date">Sampai Tanggal</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-2"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            onClick={applyFilters}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            <Filter className="h-4 w-4 mr-2" />
            Terapkan Filter
          </Button>
          <Button
            onClick={() => {
              setSearchNama("")
              setSelectedPelatihan("all")
              setSelectedJadwal("all")
              setStartDate("")
              setEndDate("")
              loadInitialData()
            }}
            variant="outline"
            disabled={loading}
          >
            Reset Filter
          </Button>
        </div>
      </div>

      {/* Export Section */}
      <div className="flex justify-end">
        <Button
          onClick={exportToCSV}
          className="bg-green-600 hover:bg-green-700 gap-2"
          disabled={data.length === 0}
        >
          <Download className="h-4 w-4" />
          Export ke CSV
        </Button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center py-8 text-gray-500"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center py-8 text-gray-500"
                  >
                    Tidak ada data absensi
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t">
          <div className="text-sm text-gray-500">
            Halaman {table.getState().pagination.pageIndex + 1} dari{" "}
            {table.getPageCount() || 1}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4" />
              Sebelumnya
            </Button>
            <Button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              variant="outline"
              size="sm"
            >
              Berikutnya
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
