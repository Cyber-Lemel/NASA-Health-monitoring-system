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
        Schema::create('dataset_records', function (Blueprint $table) {
            $table->id();
            $table->string('Astronaut')->nullable();
            $table->string('Name')->nullable();
            $table->integer('Age_at_mission_start')->nullable();
            $table->string('Gender')->nullable();
            $table->string('Country')->nullable();
            $table->integer('Mission_duration(Days)')->nullable();
            $table->string('Bone_Density_Loss')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dataset_records');
    }
};
