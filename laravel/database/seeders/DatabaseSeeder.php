<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Romahdona Wijaya',
            'email' => 'test@example.com',
            'password' => \Illuminate\Support\Facades\Hash::make('test@example.com'),
            'role' => 'customer',
        ]);

        // Admin untuk integrasi Next.js (Pengaturan Akun)
        User::updateOrCreate(
            ['email' => 'alfreinsco@gmail.com'],
            [
                'name' => 'Marthin Alfreinsco Salakory',
                'password' => \Illuminate\Support\Facades\Hash::make('alfreinsco@gmail.com'),
                'role' => 'admin',
            ]
        );
        User::updateOrCreate(
            ['email' => 'deceumamity@gmail.com'],
            [
                'name' => 'Dede Umamity',
                'password' => \Illuminate\Support\Facades\Hash::make('deceumamity@gmail.com'),
                'role' => 'admin',
            ]
        );
    }
}
