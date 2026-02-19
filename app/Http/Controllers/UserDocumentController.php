<?php

namespace App\Http\Controllers;

use App\Models\UserDocument;
use Illuminate\Http\Request;

class UserDocumentController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'description' => 'required|string|max:255',
            'file' => 'required|file|mimes:pdf,jpg,jpeg|max:10240'
        ]);

        $file = $request->file('file');
        $path = $file->store('documents', 'public');

        $document = UserDocument::create([
            'user_id' => auth()->id(),
            'description' => $request->description,
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName()
        ]);

        return response()->json([
            'success' => true,
            'document' => [
                'id' => $document->id,
                'description' => $document->description,
                'date' => $document->created_at->format('d/m/Y H:i')
            ]
        ]);
    }

    public function index()
    {
        $documents = UserDocument::where('user_id', auth()->id())
            ->latest()
            ->get()
            ->map(fn($doc) => [
                'id' => $doc->id,
                'description' => $doc->description,
                'file_name' => $doc->file_name,
                'date' => $doc->created_at->format('d/m/Y H:i')
            ]);

        return response()->json($documents);
    }

    public function download($id)
    {
        $document = UserDocument::where('user_id', auth()->id())->findOrFail($id);
        return response()->download(storage_path('app/public/' . $document->file_path), $document->file_name);
    }
}
