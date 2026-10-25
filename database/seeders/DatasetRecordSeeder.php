<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatasetRecordSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $records = [
            [
                'Astronaut' => 'AST-01',
                'Name' => 'Commander Alex Vance',
                'Age_at_mission_start' => 42,
                'Gender' => 'Male',
                'Country' => 'USA',
                'Mission_duration(Days)' => 180,
                'Bone_Density_Loss' => '-3.2%',
            ],
            [
                'Astronaut' => 'AST-02',
                'Name' => 'Dr. Elena Rostova',
                'Age_at_mission_start' => 38,
                'Gender' => 'Female',
                'Country' => 'Canada',
                'Mission_duration(Days)' => 210,
                'Bone_Density_Loss' => '-4.1%',
            ],
            [
                'Astronaut' => 'AST-03',
                'Name' => 'Major Marcus Cole',
                'Age_at_mission_start' => 45,
                'Gender' => 'Male',
                'Country' => 'UK',
                'Mission_duration(Days)' => 165,
                'Bone_Density_Loss' => '-2.8%',
            ],
            [
                'Astronaut' => 'AST-04',
                'Name' => 'Dr. Peggy Whitson',
                'Age_at_mission_start' => 48,
                'Gender' => 'Female',
                'Country' => 'USA',
                'Mission_duration(Days)' => 288,
                'Bone_Density_Loss' => '-5.4%',
            ],
            [
                'Astronaut' => 'AST-05',
                'Name' => 'Col. Chris Hadfield',
                'Age_at_mission_start' => 53,
                'Gender' => 'Male',
                'Country' => 'Canada',
                'Mission_duration(Days)' => 146,
                'Bone_Density_Loss' => '-2.5%',
            ],
            [
                'Astronaut' => 'AST-06',
                'Name' => 'Sunita Williams',
                'Age_at_mission_start' => 41,
                'Gender' => 'Female',
                'Country' => 'USA',
                'Mission_duration(Days)' => 195,
                'Bone_Density_Loss' => '-3.8%',
            ],
            [
                'Astronaut' => 'AST-07',
                'Name' => 'Capt. Scott Kelly',
                'Age_at_mission_start' => 51,
                'Gender' => 'Male',
                'Country' => 'USA',
                'Mission_duration(Days)' => 340,
                'Bone_Density_Loss' => '-6.8%',
            ],
            [
                'Astronaut' => 'AST-08',
                'Name' => 'Dr. Samantha Cristoforetti',
                'Age_at_mission_start' => 37,
                'Gender' => 'Female',
                'Country' => 'Italy',
                'Mission_duration(Days)' => 199,
                'Bone_Density_Loss' => '-3.6%',
            ],
            [
                'Astronaut' => 'AST-09',
                'Name' => 'Koichi Wakata',
                'Age_at_mission_start' => 50,
                'Gender' => 'Male',
                'Country' => 'Japan',
                'Mission_duration(Days)' => 188,
                'Bone_Density_Loss' => '-3.4%',
            ],
            [
                'Astronaut' => 'AST-10',
                'Name' => 'Thomas Pesquet',
                'Age_at_mission_start' => 39,
                'Gender' => 'Male',
                'Country' => 'France',
                'Mission_duration(Days)' => 196,
                'Bone_Density_Loss' => '-3.5%',
            ],
            [
                'Astronaut' => 'AST-11',
                'Name' => 'Dr. Jessica Meir',
                'Age_at_mission_start' => 42,
                'Gender' => 'Female',
                'Country' => 'USA',
                'Mission_duration(Days)' => 205,
                'Bone_Density_Loss' => '-4.0%',
            ],
            [
                'Astronaut' => 'AST-12',
                'Name' => 'Luca Parmitano',
                'Age_at_mission_start' => 43,
                'Gender' => 'Male',
                'Country' => 'Italy',
                'Mission_duration(Days)' => 201,
                'Bone_Density_Loss' => '-3.9%',
            ],
        ];

        DB::table('dataset_records')->truncate();
        DB::table('dataset_records')->insert($records);
    }
}
