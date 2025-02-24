<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Orders extends Model
{
    protected $primaryKey = 'id';
    protected $fillable = [
        'no_order',
        'nama_pelanggan',
        'alamat_pelanggan',
        'no_hp_pelanggan',
        'keterangan',
        'status',
        'user_id',
        'kepala_teknisi_id',
        'teknisi_id',
    ];

    public function kepalaTeknisi()
    {
        return $this->belongsTo(User::class, 'kepala_teknisi_id');
    }

    public function teknisi()
    {
        return $this->belongsTo(User::class, 'teknisi_id');
    }
}
