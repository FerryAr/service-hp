<?php

namespace Database\Seeders;

use App\Models\User;
use Bouncer;
use Illuminate\Database\Seeder;

class BouncerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Roles
        $cs = Bouncer::role()->firstOrCreate([
            'name' => 'cs',
            'title' => 'Customer Service',
        ]);

        $kepalaTeknisi = Bouncer::role()->firstOrCreate([
            'name' => 'kepala_teknisi',
            'title' => 'Kepala Teknisi',
        ]);

        $teknisi = Bouncer::role()->firstOrCreate([
            'name' => 'teknisi',
            'title' => 'Teknisi',
        ]);

        // Create Abilities
        // CS Abilities
        Bouncer::ability()->firstOrCreate([
            'name' => 'create-order',
            'title' => 'Membuat order baru',
        ]);

        Bouncer::ability()->firstOrCreate([
            'name' => 'list-order',
            'title' => 'Melihat daftar order',
        ]);



        Bouncer::ability()->firstOrCreate([
            'name' => 'transfer-to-kepala',
            'title' => 'Transfer order ke kepala teknisi',
        ]);

        // Kepala Teknisi Abilities
        Bouncer::ability()->firstOrCreate([
            'name' => 'upload-bongkar',
            'title' => 'Upload foto bongkar HP',
        ]);

        Bouncer::ability()->firstOrCreate([
            'name' => 'assign-teknisi',
            'title' => 'Assign order ke teknisi',
        ]);

        // Teknisi Abilities
        Bouncer::ability()->firstOrCreate([
            'name' => 'upload-before',
            'title' => 'Upload foto sebelum perbaikan',
        ]);

        Bouncer::ability()->firstOrCreate([
            'name' => 'request-extension',
            'title' => 'Minta perpanjangan waktu',
        ]);

        // Assign Abilities to Roles
        Bouncer::allow('cs')->to(['list-order', 'create-order', 'transfer-to-kepala']);
        Bouncer::allow('kepala_teknisi')->to(['list-order', 'upload-bongkar', 'assign-teknisi']);
        Bouncer::allow('teknisi')->to(['list-order', 'upload-before', 'request-extension']);
    }
}
