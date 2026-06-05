<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Creator;
use App\Models\CreatorSetting;
use App\Models\Enrolment;
use App\Models\Lesson;
use App\Models\Module;
use App\Models\Payment;
use App\Models\Student;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Roles ──────────────────────────────────────────────────────────────
        $this->command->info('Creating roles...');
        Role::firstOrCreate(['name' => 'creator', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'student',  'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'admin',    'guard_name' => 'web']);

        // ── Test Creator ───────────────────────────────────────────────────────
        $this->command->info('Creating test creator...');
        $creator = Creator::firstOrCreate(
            ['email' => 'shah@test.com'],
            [
                'name'              => 'Shah Nawaz',
                'slug'              => 'shahnawaz',
                'password'          => Hash::make('password'),
                'bio'               => 'Trading educator & course creator. 10+ years experience in Indian stock markets.',
                'email_verified_at' => now(),
                'gstin'             => '27AABCU9603R1ZM',
                'business_name'     => 'Shah Trading Academy',
                'state_code'        => '27',
                'plan'              => 'pro',
            ]
        );
        $creator->assignRole('creator');

        CreatorSetting::firstOrCreate(
            ['creator_id' => $creator->id],
            [
                'primary_color'   => '#c84b31',
                'secondary_color' => '#1a3a5c',
                'font_family'     => 'DM Sans',
                'invoice_prefix'  => 'STA',
            ]
        );

        // ── Courses ────────────────────────────────────────────────────────────
        $this->command->info('Creating courses...');
        $course1 = Course::firstOrCreate(
            ['creator_id' => $creator->id, 'slug' => 'trading-masterclass-for-beginners'],
            [
                'title'          => 'Trading Masterclass for Beginners',
                'description'    => 'Learn stock trading from scratch. Covers technical analysis, chart patterns, risk management, and live trading strategies for the Indian market.',
                'category'       => 'Finance',
                'language'       => 'hi',
                'status'         => 'published',
                'pricing_type'   => 'one_time',
                'price_inr'      => 299900, // ₹2,999
                'published_at'   => now()->subDays(30),
                'certificate_enabled' => true,
                'community_enabled'   => true,
                'meta_title'     => 'Trading Masterclass for Beginners | Shah Trading Academy',
                'meta_description' => 'Master stock trading in 30 days. Technical analysis, chart patterns, and real trading strategies for Indian markets.',
            ]
        );

        $course2 = Course::firstOrCreate(
            ['creator_id' => $creator->id, 'slug' => 'advanced-options-trading'],
            [
                'title'        => 'Advanced Options Trading Strategy',
                'description'  => 'Options strategies for experienced traders. Learn Iron Condor, Butterfly, and hedging techniques.',
                'category'     => 'Finance',
                'language'     => 'hi',
                'status'       => 'draft',
                'pricing_type' => 'one_time',
                'price_inr'    => 499900, // ₹4,999
            ]
        );

        // ── Modules & Lessons for Course 1 ────────────────────────────────────
        $this->command->info('Creating curriculum...');
        $module1 = Module::firstOrCreate(
            ['course_id' => $course1->id, 'title' => 'Getting Started'],
            ['order' => 1]
        );

        Lesson::firstOrCreate(
            ['module_id' => $module1->id, 'title' => 'Welcome to the Course'],
            [
                'course_id'      => $course1->id,
                'content_type'   => 'video',
                'is_free_preview' => true,
                'duration_seconds' => 300,
                'video_status'   => 'ready',
                'order'          => 1,
            ]
        );

        Lesson::firstOrCreate(
            ['module_id' => $module1->id, 'title' => 'Setting Up Your Trading Account'],
            [
                'course_id'    => $course1->id,
                'content_type' => 'text',
                'content'      => '<h2>Setting Up Your Trading Account</h2><p>In this lesson, we cover how to open a Zerodha or Angel One account...</p>',
                'order'        => 2,
            ]
        );

        $module2 = Module::firstOrCreate(
            ['course_id' => $course1->id, 'title' => 'Technical Analysis Fundamentals'],
            ['order' => 2]
        );

        Lesson::firstOrCreate(
            ['module_id' => $module2->id, 'title' => 'Reading Candlestick Charts'],
            [
                'course_id'      => $course1->id,
                'content_type'   => 'video',
                'duration_seconds' => 1800,
                'video_status'   => 'ready',
                'order'          => 1,
            ]
        );

        Lesson::firstOrCreate(
            ['module_id' => $module2->id, 'title' => 'Support & Resistance Levels'],
            [
                'course_id'      => $course1->id,
                'content_type'   => 'video',
                'duration_seconds' => 2400,
                'video_status'   => 'ready',
                'order'          => 2,
            ]
        );

        // ── Test Students ──────────────────────────────────────────────────────
        $this->command->info('Creating test students...');
        $student1 = Student::firstOrCreate(
            ['email' => 'rahul@test.com'],
            [
                'name'              => 'Rahul Sharma',
                'password'          => Hash::make('password'),
                'phone'             => '+919876543210',
                'email_verified_at' => now(),
            ]
        );
        $student1->assignRole('student');

        $student2 = Student::firstOrCreate(
            ['email' => 'priya@test.com'],
            [
                'name'              => 'Priya Patel',
                'password'          => Hash::make('password'),
                'phone'             => '+919876543211',
                'email_verified_at' => now(),
            ]
        );
        $student2->assignRole('student');

        $student3 = Student::firstOrCreate(
            ['email' => 'amit@test.com'],
            [
                'name'              => 'Amit Kumar',
                'password'          => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $student3->assignRole('student');

        // ── Enrolments ─────────────────────────────────────────────────────────
        $this->command->info('Creating enrolments...');
        foreach ([$student1, $student2] as $student) {
            Enrolment::firstOrCreate(
                ['student_id' => $student->id, 'course_id' => $course1->id],
                [
                    'status'     => 'active',
                    'source'     => 'purchase',
                    'enrolled_at' => now()->subDays(random_int(1, 25)),
                ]
            );
        }

        Enrolment::firstOrCreate(
            ['student_id' => $student3->id, 'course_id' => $course1->id],
            [
                'status'     => 'active',
                'source'     => 'manual',
                'enrolled_at' => now()->subDays(5),
            ]
        );

        // ── Sample Payment ─────────────────────────────────────────────────────
        $this->command->info('Creating sample payment...');
        Payment::firstOrCreate(
            ['gateway_payment_id' => 'pay_test_seed_001'],
            [
                'creator_id'         => $creator->id,
                'student_id'         => $student1->id,
                'course_id'          => $course1->id,
                'currency'           => 'INR',
                'base_amount'        => 253932, // ₹2999 base (after 18% GST reverse calc)
                'gst_amount'         => 45708,  // 18% GST
                'cgst_rate'          => 9.0,
                'cgst_amount'        => 22854,
                'sgst_rate'          => 9.0,
                'sgst_amount'        => 22854,
                'total_amount'       => 299900, // ₹2,999
                'gateway'            => 'razorpay',
                'gateway_order_id'   => 'order_test_seed_001',
                'gateway_payment_id' => 'pay_test_seed_001',
                'payment_method'     => 'upi',
                'status'             => 'captured',
                'paid_at'            => now()->subDays(20),
            ]
        );

        $this->command->info('✓ Seeding complete.');
        $this->command->table(
            ['Entity', 'Count'],
            [
                ['Creators',   Creator::count()],
                ['Courses',    Course::count()],
                ['Modules',    Module::count()],
                ['Lessons',    Lesson::count()],
                ['Students',   Student::count()],
                ['Enrolments', Enrolment::count()],
                ['Payments',   Payment::count()],
            ]
        );
    }
}
