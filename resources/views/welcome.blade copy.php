<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>Home Page</title>
<meta name="viewport" content="width=device-width" />
<link href="{{ asset('App_Themes/common.css') }}" rel="stylesheet" />
<link href="{{ asset('App_Themes/pagination.css') }}" rel="stylesheet" />
<link href="{{ asset('App_Themes/mediaelementplayer.css') }}" rel="stylesheet" />
<link href="{{ asset('App_Themes/Default/htmldocs.css') }}" type="text/css" rel="stylesheet" />
<link href="{{ asset('App_Themes/Default/master.css') }}" type="text/css" rel="stylesheet" />
<link href="{{ asset('App_Themes/Default/menu.css') }}" type="text/css" rel="stylesheet" />
<link href="{{ asset('App_Themes/Default/number_slideshow.css') }}" type="text/css" rel="stylesheet" />
<link href="{{ asset('App_Themes/Default/ourgovt.css') }}" type="text/css" rel="stylesheet" />
<link href="{{ asset('App_Themes/Default/screen.css') }}" type="text/css" rel="stylesheet" />
</head>
<body>
<div id="header">
<div id="header-trap" style="background-image: url('{{ asset('images/header.jpg') }}'); background-repeat: no-repeat; width: 1024px; height: 217px"></div>
</div>

<span id="mainMenu"><div class="navbar"><div class="nav-trap"><ul class="navigation">
<li class="red-active"><a href="/">Home</a></li>
<li class="orange"><a href="/citizens">Citizens / Residents</a></li>
<li class="pink"><a href="/non-residents">Non-Residents</a></li>
<li class="green"><a href="/businesses">Businesses</a></li>
<li class="blue"><a href="/employees">Government Employees</a></li>
<li class="blue"><a href="/login">Login</a></li>
</ul></div></div></span>

<div id="hero"></div>

<div class='container-hp'>
<div id="side-left">
    <div class="side-widget-v">
	<h1 class="theme-match">Our Government</h1>
	<ul>
		<li><a href="#">Governor General</a></li>
		<li><a href="#">Prime Minister</a></li>
		<li><a href="#">Cabinet of Ministers</a></li>
		<li><a href="#">House of Assembly</a></li>
	</ul>
</div>
    <div class="side-widget-v">
	<h1 class="theme-match">Access Government</h1>
	<ul>
		<li><a href="#">Departments</a></li>
		<li><a href="#">Directory</a></li>
		<li><a href="#">Statutory Bodies</a></li>
	</ul>
</div>
</div>

<div id="home-mid">
    <h1>Latest News</h1>
    <div class="rc-container">
        <p>Welcome to Government Portal</p>
    </div>
</div>

<div id="side-right">
    <div class="side-widget-v">
	<h1 class="theme-match">E-Services</h1>
	<ul>
		<li><a href="#">Tax e-Filing</a></li>
		<li><a href="#">Companies / IP</a></li>
		<li><a href="#">Customs / Excise</a></li>
	</ul>
</div>
</div>

<div class="clear"></div>
</div>

<div id="footer">
	<div id="footer-trap">
        <p style="text-align: center;">&copy; {{ date('Y') }} Government Portal</p>
    </div>
</div>

<script src="{{ asset('Scripts/jquery-1.11.2.min.js') }}"></script>
<script src="{{ asset('Scripts/jquery-ui-1.11.4.min.js') }}"></script>
</body>
</html>
