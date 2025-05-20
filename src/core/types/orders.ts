import type { OrderMedia } from "./orderMedia";
import type { OrderTimeline } from "./orderTimeline";
import type { User } from "./user";

export type Orders = {
    id:                   number;
    no_order:             string;
    nama_pelanggan:       string;
    alamat_pelanggan:     string;
    no_hp_pelanggan:      string;
    merkHp:             string;
    modelHp:          string;
    seriHp:            string;
    imeiHp:            string;
    keterangan:           string;
    cs_transfer_deadline: null;
    bongkar_deadline:     null;
    perbaikan_deadline:   null;
    qc_kepala_deadline:   null;
    qc_cs_deadline:       null;
    status:               string;
    createdAt:          Date;
    updatedAt:          Date;
    OrderTimeline:      OrderTimeline[];
    kepala_teknisi:      User | null;
    teknisi:            User | null;
    fotoHp:             FotoHP | null;
}

export interface FotoHP {
    csShot: OrderMedia[];
    arrival: OrderMedia[];
    bongkar: OrderMedia[];
    before: OrderMedia[];
    after: OrderMedia[];
    video: OrderMedia[];
    qc: OrderMedia[];
}