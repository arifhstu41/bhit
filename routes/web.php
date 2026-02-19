<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/login', function () {
    if (auth()->check()) {
        return redirect('/home');
    }
    return view('login');
});

Route::post('/login', function (\Illuminate\Http\Request $request) {
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    if (\Illuminate\Support\Facades\Auth::attempt(['email' => $request->email, 'password' => $request->password])) {
        $request->session()->regenerate();
        return redirect('/home');
    }

    return back()->with('error', 'Invalid credentials');
});

Route::get('/register', function () {
    return view('register');
});

Route::post('/register', function (\Illuminate\Http\Request $request) {
    $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users',
        'password' => 'required|min:6',
    ]);

    \App\Models\User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => \Illuminate\Support\Facades\Hash::make($request->password),
        'admin' => 0,
        'active' => 0,
    ]);

    return redirect('/login')->with('success', 'Registration successful! Please login.');
});

Route::get('/home', function () {
    if (auth()->user()->admin == 1) {
        $users = \App\Models\User::all();
        return view('admin', compact('users'));
    }
    return view('home');
})->middleware('auth');

Route::post('/admin/toggle-active/{id}', function ($id) {
    $user = \App\Models\User::findOrFail($id);
    $user->active = !$user->active;
    $user->save();
    return redirect('/home')->with('success', 'User status updated!');
})->middleware('auth');

Route::get('/logout', function (\Illuminate\Http\Request $request) {
    \Illuminate\Support\Facades\Auth::logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();
    return redirect('/');
})->middleware('auth');

Route::get('/user/profile', function () {
    $profile = \App\Models\UserProfile::where('user_id', auth()->id())->first();
    
    // Convert dates from yyyy-mm-dd to dd/mm/yyyy for display
    if ($profile) {
        $dateFields = ['date_of_birth', 'document_expiry', 'residence_start_date', 'entry_date_portugal'];
        foreach ($dateFields as $field) {
            if (!empty($profile->$field)) {
                $date = \DateTime::createFromFormat('Y-m-d', $profile->$field);
                $profile->$field = $date ? $date->format('d/m/Y') : $profile->$field;
            }
        }
    }
    
    return view('user', compact('profile'));
})->middleware('auth');

Route::post('/user/profile', function (\Illuminate\Http\Request $request) {
    $validated = $request->validate([
        'full_name' => 'nullable|string|max:255',
        'first_name' => 'nullable|string|max:255',
        'last_name' => 'nullable|string|max:255',
        'father_surname' => 'nullable|string|max:255',
        'father_name' => 'nullable|string|max:255',
        'mother_surname' => 'nullable|string|max:255',
        'mother_name' => 'nullable|string|max:255',
        'sex' => 'nullable|string|max:1',
        'education_level' => 'nullable|string|max:1',
        'marital_status' => 'nullable|string|max:1',
        'phone' => 'nullable|string|max:20',
        'address' => 'nullable|string|max:255',
        'address_2' => 'nullable|string|max:255',
        'city' => 'nullable|string|max:100',
        'country' => 'nullable|string|max:100',
        'country_code' => 'nullable|string|max:10',
        'date_of_birth' => 'nullable|string|max:20',
        'nationality' => 'nullable|string|max:100',
        'passport_number' => 'nullable|string|max:50',
        'gender' => 'nullable|string|max:20',
        'place_of_birth' => 'nullable|string|max:255',
        'occupation' => 'nullable|string|max:255',
        'emergency_contact' => 'nullable|string|max:255',
        'emergency_phone' => 'nullable|string|max:20',
        'additional_info' => 'nullable|string',
        'document_type' => 'nullable|string|max:1',
        'document_number' => 'nullable|string|max:100',
        'document_issue_date' => 'nullable|string|max:20',
        'document_expiry_date' => 'nullable|string|max:20',
        'document_expiry' => 'nullable|string|max:20',
        'issuing_country' => 'nullable|string|max:100',
        'issuing_country_code' => 'nullable|string|max:10',
        'postal_code' => 'nullable|string|max:20',
        'residence_start_date' => 'nullable|string|max:20',
        'alternative_email' => 'nullable|email|max:255',
        'entry_date_portugal' => 'nullable|string|max:20',
        'professional_group' => 'nullable|string|max:255',
        'occupation_detail' => 'nullable|string|max:255',
    ]);

    // Convert date format from dd/mm/yyyy to yyyy-mm-dd
    $dateFields = ['date_of_birth', 'document_expiry', 'residence_start_date', 'entry_date_portugal'];
    foreach ($dateFields as $field) {
        if (!empty($validated[$field])) {
            $date = \DateTime::createFromFormat('d/m/Y', $validated[$field]);
            $validated[$field] = $date ? $date->format('Y-m-d') : null;
        }
    }

    \App\Models\UserProfile::updateOrCreate(
        ['user_id' => auth()->id()],
        $validated
    );

    return redirect('/user/profile')->with('success', 'Profile updated successfully!');
})->middleware('auth');

Route::post('/user-documents', [\App\Http\Controllers\UserDocumentController::class, 'store'])->middleware('auth');
Route::get('/user-documents', [\App\Http\Controllers\UserDocumentController::class, 'index'])->middleware('auth');
Route::get('/user-documents/{id}/download', [\App\Http\Controllers\UserDocumentController::class, 'download'])->middleware('auth');
