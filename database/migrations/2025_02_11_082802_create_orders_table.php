<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('no_order')->unique();
            $table->string('nama_pelanggan');
            $table->string('alamat_pelanggan');
            $table->string('no_hp_pelanggan');
            $table->string('keterangan');
            $table->foreignId('user_id')->constrained(); // CS yang membuat
            $table->foreignId('kepala_teknisi_id')->nullable()->constrained('users');
            $table->foreignId('teknisi_id')->nullable()->constrained('users');
            $table->timestamp('cs_transfer_deadline')->nullable(); // Batas waktu transfer ke kepala teknisi
            $table->timestamp('bongkar_deadline')->nullable(); // Batas waktu upload foto bongkar
            $table->timestamp('perbaikan_deadline')->nullable(); // Batas waktu perbaikan
            $table->timestamp('qc_kepala_deadline')->nullable(); // Batas QC kepala teknisi
            $table->timestamp('qc_cs_deadline')->nullable(); // Batas QC CS
            $table->enum('status', [
                'draft', 
                'waiting_bongkar',
                'in_progress',
                'need_extension',
                'waiting_qc_kepala',
                'waiting_qc_cs',
                'completed',
                'overdue'
            ])->default('draft');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
