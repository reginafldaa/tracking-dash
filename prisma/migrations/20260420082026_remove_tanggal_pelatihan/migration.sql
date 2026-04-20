/*
  Warnings:

  - You are about to drop the column `tanggal` on the `Pelatihan` table. All the data in the column will be lost.
  - Made the column `jadwalId` on table `Pendaftaran` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Pelatihan" DROP COLUMN "tanggal";

-- AlterTable
ALTER TABLE "Pendaftaran" ALTER COLUMN "jadwalId" SET NOT NULL;
