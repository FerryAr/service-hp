<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

use App\Models\Orders;

class OrderTransferredToKepala implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $orders;

    public function __construct(Orders $orders)
    {
        $this->orders = $orders;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('kepala_teknisi');
    }

    public function broadcastWith()
    {
        return [
            'order_id' => $this->order->id,
            'message' => 'Order baru perlu diproses!',
            'deadline' => $this->order->cs_transfer_deadline
        ];
    }
}
