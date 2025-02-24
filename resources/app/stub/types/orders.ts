export interface Orders {
    id: number;
    no_order: string;
    nama_pelanggan: string;
    alamat_pelanggan: string;
    no_hp_pelanggan: string;
    keterangan: string;
    user_id: number;
    kepala_teknisi_id: null;
    teknisi_id: null;
    cs_transfer_deadline: null;
    bongkar_deadline: null;
    perbaikan_deadline: null;
    qc_kepala_deadline: null;
    qc_cs_deadline: null;
    status: string;
    created_at: Date;
    updated_at: Date;
    kepala_teknisi: null;
    teknisi: null;
}
