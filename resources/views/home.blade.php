<!DOCTYPE html>
<html>
<head>
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>SEF for Ukraine</title>
<link href="{{ asset('Content/bootstrap.css') }}" rel="stylesheet" />
<link href="{{ asset('Content/Site.css') }}" rel="stylesheet" />
<style>
.navbar-blue { background-color: rgb(27 66 110/0.8); }
.bg-video { position: fixed; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: -1; }
</style>
</head>
<body class="d-flex flex-column h-100">
<header class="fixed-top navbar-blue ps-1">
    <div class="container">
        <div class="row py-2">
            <div class="col-4">
                <a href="/" class="float-start">
                    <img class="img-fluid" src="{{ asset('images/logo.png') }}" /></a>
            </div>
            <div class="col-8">
                <div class="float-end LogInV clearfix">
                    <span class="text-white p-2">{{ auth()->user()->email }}</span>
                    <a href="/logout" class="link-light p-2">Logout</a>
                </div>
            </div>
        </div>
    </div>
</header>

<main role="main" class="flex-shrink-0 mb-5" style="margin-top: 100px;">
    <div class="container">
        <video autoplay muted loop playsinline class="bg-video">
            <source src="{{ asset('images/bgv.MP4') }}" type="video/mp4">
        </video>
        <div class="h-100">
            <div class="container-fluid mt-6">
                <div class="card card-body bg-light bg-opacity-75 my-5 py-5 align-middle">
                    <h3>Introduction to the Saint Lucia Passport</h3>
                    <p>The Saint Lucia passport is an official travel and identification document issued by the Government of Saint Lucia to eligible citizens of the country. 
                    It serves as proof of Saint Lucian citizenship and grants the holder the right to travel internationally, seek consular protection abroad, and enjoy the privileges and protections afforded by the laws of Saint Lucia. 
                    Saint Lucia, a sovereign Caribbean nation and a member of the Commonwealth, issues passports in accordance with its national immigration and citizenship laws. 
                    Holders of the Saint Lucia passport may benefit from visa-free or visa-on-arrival access to several countries and territories worldwide, subject to international agreements and host country regulations. 
                    The Saint Lucia passport reflects the country's commitment to secure identification, international cooperation, and the facilitation of global mobility for its citizens. 
                    Passport issuance and administration are handled by designated government authorities, ensuring compliance with international travel standards and security requirements.</p>
                    <h4>Related Government Links</h4>
                    <ul>
                        <li>Government of Saint Lucia – Official Portal: <a href="https://www.gov.lc" target="_blank">https://www.gov.lc</a></li>
                        <li>Ministry of Home Affairs, Justice and National Security: <a href="https://www.gov.lc/ministries" target="_blank">https://www.gov.lc/ministries</a></li>
                        <li>Saint Lucia Immigration Department: <a href="https://www.gov.lc/ministries/home-affairs" target="_blank">https://www.gov.lc/ministries/home-affairs</a></li>
                        <li>Saint Lucia Ministry of External Affairs: <a href="https://www.gov.lc/ministries/external-affairs" target="_blank">https://www.gov.lc/ministries/external-affairs</a></li>
                        <li>Saint Lucia Citizenship by Investment Unit: <a href="https://www.cipsaintlucia.co" target="_blank">https://www.cipsaintlucia.co</a></li>
                    </ul>
                    @if(auth()->user()->active == 1)
                    <div class="align-self-end">
                        <a class="float-end" href="/user/profile">Start/view your passport process</a>
                    </div>
                    @endif
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
</body>
</html>
