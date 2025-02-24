<?php

use Illuminate\Support\Facades\Broadcast;
// use Bouncer;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('kepala_teknisi', function ($user) {
    if (!$user) {
        return false;
    }

    return Bouncer::is($user)->a('kepala_teknisi');
});