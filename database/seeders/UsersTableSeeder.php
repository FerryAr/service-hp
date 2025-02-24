<?php

namespace Database\Seeders;

use App\Models\User;
use Bouncer;
use Illuminate\Database\Seeder;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::factory(1)->create(
            [
                'first_name' => 'Luke',
                'last_name' => 'Skywalker',
                'email' => 'luke@jedi.com',
                'email_verified_at' => null,
                'password' => bcrypt('123123'),
            ]
        );

        Bouncer::assign('cs')->to($users->first());

        $users = User::factory(1)->create(
            [
                'first_name' => 'Darth',
                'last_name' => 'Vader',
                'email' => 'vader@sith.com',
                'email_verified_at' => null,
                'password' => bcrypt('123123'),
            ]
        );

        Bouncer::assign('teknisi')->to($users->first());

        $users = User::factory(1)->create(
            [
                'first_name' => 'Leia',
                'last_name' => 'Organa',
                'email' => 'leia@rebel.com',
                'email_verified_at' => null,
                'password' => bcrypt('123123'),
            ]
        );

        Bouncer::assign('kepala_teknisi')->to($users->first());
    }
}
