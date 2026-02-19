<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserDocument extends Model
{
    protected $fillable = ['user_id', 'description', 'file_path', 'file_name'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
