<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OrderCreateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'purchase_group_id' => ['required', 'integer', 'exists:purchase_groups,id'],
            'customer_name' => ['required', 'string', 'max:255'],
            'platform_id' => ['required', 'integer', 'exists:platforms,id'],
            'deposit' => ['nullable', 'numeric', 'min:0'],
            'account_last5' => ['nullable', 'string', 'size:5'],
            'shipping_method_id' => ['required', 'integer', 'exists:shipping_methods,id'],
            'shipping_number' => ['nullable', 'string', 'max:255'],
            'shipping_status' => ['required', 'boolean'],
            'is_finished' => ['boolean'],
            'note' => ['nullable', 'string'],
            'ordered_at' => ['required', 'date'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ];
    }
}
