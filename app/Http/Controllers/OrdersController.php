<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Orders;
use App\Models\OrderMedia;
use Illuminate\Support\Str;
use App\Events\OrderTransferredToKepala;

class OrdersController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $orders = Orders::with([
            'kepalaTeknisi' => function ($query) {
            $query->select('id', 'first_name', 'last_name');
            },
            'teknisi' => function ($query) {
            $query->select('id', 'first_name', 'last_name');
            }
        ])->get();

        return response()->json($orders);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nama_pelanggan'     => 'required|string',
            'alamat_pelanggan'   => 'required|string',
            'no_hp_pelanggan'    => 'required|string',
            'foto_hp'           => 'required|array|max:5',
            'foto_hp.*'         => 'image|mimes:jpeg,png,jpg,gif,svg|max:5120', // max 5MB per file
            'keterangan' => 'required|string',
        ]);

        $storedPhotos = [];
        if ($request->hasFile('foto_hp')) {
            foreach ($request->file('foto_hp') as $file) {
                $filename = Str::random(10) . '_' . time() . '.' . $file->getClientOriginalExtension();
                $fileSize = $file->getSize();
                $path = $file->storeAs('orders', $filename, 'public');
                $storedPhotos[] = (object) array(
                    'filename' => $filename,
                    'type' => 'before',
                    'path' => $path,
                    'file_size' => $fileSize,
                );
            }
        }

        $user = $request->user();

        $order = Orders::create([
            'no_order' => (string) Str::uuid(),
            'nama_pelanggan' => $request->nama_pelanggan,
            'alamat_pelanggan' => $request->alamat_pelanggan,
            'no_hp_pelanggan' => $request->no_hp_pelanggan,
            'keterangan' => $request->keterangan,
            'user_id' => $user->id,
        ]);
    
        foreach ($storedPhotos as $photo) {
            OrderMedia::create([
                'order_id' => $order->id,
                'type' => $photo->type,
                'path' => $photo->path,
                'file_size' => $photo->file_size,
            ]);
        }

        // TODO: send notification to kepala teknisi
        event(new OrderTransferredToKepala($order));
        broadcast(new OrderTransferredToKepala($order))->toOthers();

        // return 201 only if the order is successfully created
        return response()->json($order, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
