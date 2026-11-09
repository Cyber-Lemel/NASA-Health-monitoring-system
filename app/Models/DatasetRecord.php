<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DatasetRecord extends Model
{
    // Point directly to the exact table name in MySQL
    protected $table = 'dataset_records';

    // The primary key in MySQL is 'Astronaut' (int)
    protected $primaryKey = 'Astronaut';

    public $incrementing = false;

    protected $keyType = 'int';

    // Disable automatic created_at / updated_at
    public $timestamps = false;

    // Allow all columns to be mass assigned
    protected $guarded = [];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            // Auto-assign sequential integer ID if missing or non-numeric
            if (empty($model->Astronaut) || !is_numeric($model->Astronaut)) {
                $maxId = (int) (static::max('Astronaut') ?? 0);
                $model->Astronaut = $maxId + 1;
            }
        });
    }
}
