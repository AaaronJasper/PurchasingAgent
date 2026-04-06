<?php

namespace App\Http\Controllers;

use App\Http\Requests\OrderCreateRequest;
use App\Http\Requests\OrderUpdateRequest;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(): JsonResponse
    {
        $orders = Order::with(['purchaseGroup', 'platform', 'shippingMethod', 'items.product'])->get();

        return response()->json($orders);
    }

    public function store(OrderCreateRequest $request): JsonResponse
    {
        $order = DB::transaction(function () use ($request) {
            $order = Order::create($request->safe()->except('items'));

            $order->update(['shipping_number' => $this->generateShippingNumber($order)]);

            $this->syncItems($order, $request->input('items'));

            return $order;
        });

        return response()->json($order->load(['purchaseGroup', 'platform', 'shippingMethod', 'items.product']), 201);
    }

    public function show(Order $order): JsonResponse
    {
        return response()->json($order->load(['purchaseGroup', 'platform', 'shippingMethod', 'items.product']));
    }

    public function update(OrderUpdateRequest $request, Order $order): JsonResponse
    {
        $fields = [
            'purchase_group_id', 'customer_name', 'platform_id', 'deposit',
            'account_last5', 'shipping_method_id', 'shipping_number',
            'shipping_status', 'is_finished', 'note', 'ordered_at',
        ];

        DB::transaction(function () use ($request, $order, $fields) {
            $data = collect($fields)
                ->filter(fn($field) => $request->has($field))
                ->mapWithKeys(fn($field) => [$field => $request->input($field)])
                ->toArray();

            $order->update($data);

            if ($request->has('items')) {
                foreach ($request->input('items') as $item) {
                    if ($item['quantity'] === 0) {
                        $order->items()->where('product_id', $item['product_id'])->delete();
                        continue;
                    }

                    $product = Product::findOrFail($item['product_id']);

                    $order->items()->updateOrCreate(
                        [
                            'product_id' => $item['product_id'],
                        ],
                        [
                            'product_name' => $product->name,
                            'quantity'     => $item['quantity'],
                            'unit_price'   => $product->selling_price,
                            'total_price'  => $product->selling_price * $item['quantity'],
                        ]
                    );
                }
            }
        });

        return response()->json($order->load(['purchaseGroup', 'platform', 'shippingMethod', 'items.product']));
    }

    public function destroy(Order $order): JsonResponse
    {
        $order->delete();

        return response()->json(null, 204);
    }

    private function generateShippingNumber(Order $order): string
    {
        $counter = 0;

        do {
            $raw = implode('|', [
                $order->id,
                $order->customer_name,
                $order->platform_id,
                $order->purchase_group_id,
                $order->ordered_at,
                $counter,
            ]);

            $candidate = strtoupper(substr(hash('sha256', $raw), 0, 6));
            $counter++;
        } while (Order::where('shipping_number', $candidate)->where('id', '!=', $order->id)->exists());

        return $candidate;
    }

    private function syncItems(Order $order, array $items): void
    {
        foreach ($items as $item) {
            $product = Product::findOrFail($item['product_id']);

            $order->items()->create([
                'product_id' => $product->id,
                'product_name' => $product->name,
                'quantity' => $item['quantity'],
                'unit_price' => $product->selling_price,
                'total_price' => $product->selling_price * $item['quantity'],
            ]);
        }
    }
}
