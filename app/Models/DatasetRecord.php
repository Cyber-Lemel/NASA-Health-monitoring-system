<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DatasetRecord extends Model
{
    // 1. Point directly to the exact table name you created in phpMyAdmin
    protected $table = 'dataset_records';

    // 2. Disable Laravel's automatic timestamps to prevent SQL errors
    public $timestamps = false;

    // 3. Allow columns to be queried and assigned
    protected $guarded = [];
}