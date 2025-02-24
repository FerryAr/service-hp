<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderMedia extends Model
{
    protected $primaryKey = 'id';
    protected $fillable = [
        'order_id',
        'type',
        'path',
        'file_size',
    ];
}
