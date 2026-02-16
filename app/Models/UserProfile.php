<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserProfile extends Model
{
    protected $fillable = [
        'user_id',
        'full_name',
        'first_name',
        'last_name',
        'father_surname',
        'father_name',
        'mother_surname',
        'mother_name',
        'sex',
        'education_level',
        'marital_status',
        'phone',
        'address',
        'address_2',
        'city',
        'country',
        'country_code',
        'passport_number',
        'date_of_birth',
        'nationality',
        'gender',
        'place_of_birth',
        'occupation',
        'emergency_contact',
        'emergency_phone',
        'additional_info',
        'document_type',
        'document_number',
        'document_issue_date',
        'document_expiry_date',
        'document_expiry',
        'issuing_country',
        'issuing_country_code',
        'postal_code',
        'residence_start_date',
        'alternative_email',
        'entry_date_portugal',
        'professional_group',
        'occupation_detail',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
