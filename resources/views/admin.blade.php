<!DOCTYPE html>
<html>
<head>
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Admin Dashboard</title>
<link href="{{ asset('Content/bootstrap.css') }}" rel="stylesheet" />
<link href="{{ asset('Content/Site.css') }}" rel="stylesheet" />
<style>
.navbar-blue { background-color: rgb(27 66 110/0.8); }
.bg-image { background-image: url('{{ asset('images/bg.png') }}'); background-color: aliceblue; background-attachment: fixed; background-repeat: no-repeat; background-position-x: center; background-position-y: center; -webkit-background-size: cover; -moz-background-size: cover; -o-background-size: cover; background-size: cover; }
</style>
</head>
<body class="d-flex flex-column h-100 bg-image">
<header class="fixed-top navbar-blue ps-1">
    <div class="container">
        <div class="row py-2">
            <div class="col-4">
                <a href="/" class="float-start">
                    <img class="img-fluid" src="{{ asset('images/AIMA_H_B.png') }}" /></a>
            </div>
            <div class="col-8">
                <div class="float-end LogInV clearfix">
                    <span class="text-white p-2">Welcome, {{ auth()->user()->name }}</span>
                    <a href="/logout" role="menuitem" class="link-light p-2">Logout</a>
                </div>
            </div>
        </div>
    </div>
</header>

<main role="main" class="flex-shrink-0 mb-5" style="margin-top: 100px;">
    <div class="container">
        <div class="card mt-3 mb-3">
            <div class="card-header bg-primary text-white">
                <h5>User Management</h5>
            </div>
            <div class="card-body">
                @if(session('success'))
                    <div class="alert alert-success">{{ session('success') }}</div>
                @endif
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Admin</th>
                            <th>Active</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($users as $user)
                        <tr>
                            <td>{{ $user->id }}</td>
                            <td>{{ $user->name }}</td>
                            <td>{{ $user->email }}</td>
                            <td>{{ $user->admin ? 'Yes' : 'No' }}</td>
                            <td>
                                <span class="badge {{ $user->active ? 'bg-success' : 'bg-danger' }}">
                                    {{ $user->active ? 'Active' : 'Inactive' }}
                                </span>
                            </td>
                            <td>
                                <form method="POST" action="/admin/toggle-active/{{ $user->id }}" style="display:inline;">
                                    @csrf
                                    <button type="submit" class="btn btn-sm {{ $user->active ? 'btn-danger' : 'btn-success' }}">
                                        {{ $user->active ? 'Deactivate' : 'Activate' }}
                                    </button>
                                </form>
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</main>

<div style="margin-bottom: 80px;">
    <div class="footer-basic fixed-bottom mt-5">
        <footer>
            <div class="container">
                <div class="row">
                    <div class="col-4">
                        <p class="copyright">SEF © All rights reserved</p>
                    </div>
                    <div class="col-4"></div>
                    <div class="col-4">
                        <div class="float-end">
                            <p class="copyright"><a href="#" target="_blank" class="text-white">Privacy Policy and Cookies</a></p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    </div>
</div>
</body>
</html>
