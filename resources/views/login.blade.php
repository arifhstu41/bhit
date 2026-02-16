<!DOCTYPE html>
<html>
<head>
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Log in</title>
<link href="{{ asset('Content/fontawesome.min.css') }}" rel="stylesheet" />
<link href="{{ asset('Content/myFooter.css') }}" rel="stylesheet" />
<link href="{{ asset('Content/bootstrap.css') }}" rel="stylesheet" />
<link href="{{ asset('Content/Site.css') }}" rel="stylesheet" />
<style>
.navbar-blue { background-color: rgb(27 66 110/0.8); }
.bg-image { background-image: url('{{ asset('images/bg.png') }}'); background-color: aliceblue; background-attachment: fixed; background-repeat: no-repeat; background-position-x: center; background-position-y: center; -webkit-background-size: cover; -moz-background-size: cover; -o-background-size: cover; background-size: cover; }
.containerAU { max-width: 650px; }
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
                    <a href="/register" role="menuitem" class="p-2 link-light">Register</a>
                    <a href="/login" role="menuitem" class="link-light p-2">Authenticate</a>
                </div>
            </div>
        </div>
    </div>
</header>

<main role="main" class="flex-shrink-0 mb-5" style="margin-top: 100px;">
    <div class="container">
        <div class="containerAU drop-shadow container container-fluid pt-1 pb-1">
            <div class="card mt-3 mb-3">
                <div class="card-header bg-primary text-white">
                    <h5>Authentication</h5>
                </div>
                <div class="card-body">
                    @if(session('error'))
                        <div class="alert alert-danger">{{ session('error') }}</div>
                    @endif
                    @if($errors->any())
                        <div class="alert alert-danger">
                            <ul>
                                @foreach($errors->all() as $error)
                                    <li>{{ $error }}</li>
                                @endforeach
                            </ul>
                        </div>
                    @endif
                    <div class="row vertical-center-row">
                        <div class="col-md-12">
                            <section id="loginForm">
                                <form method="POST" action="/login">
                                    @csrf
                                    <div class="form-horizontal">
                                        <h4>Introduce account details</h4>
                                        <hr />
                                        <div class="form-group mb-3">
                                            <label for="email" class="col-md-4 control-label">Email</label>
                                            <div class="col-md-8">
                                                <input name="email" type="text" id="email" class="form-control" required />
                                            </div>
                                        </div>
                                        <div class="form-group mb-3">
                                            <label for="password" class="col-md-4 control-label">Password</label>
                                            <div class="col-md-8">
                                                <input name="password" type="password" id="password" class="form-control" required />
                                            </div>
                                        </div>
                                        <div class="form-group pt-3">
                                            <div class="col-md-offset-4 col-md-8">
                                                <button type="submit" class="btn btn-primary">Login</button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                                <p><a href="/register">Create an Account</a></p>
                            </section>
                        </div>
                    </div>
                </div>
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
<script src="{{ asset('Scripts/bootstrap.js') }}"></script>
</body>
</html>
