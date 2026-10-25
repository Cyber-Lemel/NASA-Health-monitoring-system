<?php

namespace App\Http\Controllers;

use App\Models\DatasetRecord;

class DatasetController extends Controller
{
    public function index()
    {
        // Fetch 50 rows from your manual phpMyAdmin table
        $records = DatasetRecord::take(50)->get();

        // Pass the data as a prop named 'records' to a React page named 'Dataset'
        return inertia('Dataset', [
            'records' => $records
        ]);
    }
}