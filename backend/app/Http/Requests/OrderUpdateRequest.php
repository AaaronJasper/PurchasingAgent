<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OrderUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'purchase_group_id' => ['sometimes', 'integer', 'exists:purchase_groups,id'],
            'customer_name' => ['sometimes', 'string', 'max:255'],
            'platform_id' => ['sometimes', 'integer', 'exists:platforms,id'],
            'deposit' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'account_last5' => ['sometimes', 'nullable', 'string', 'size:5'],
            'shipping_method_id' => ['sometimes', 'integer', 'exists:shipping_methods,id'],
            'shipping_number' => ['sometimes', 'nullable', 'string', 'max:255'],
            'shipping_status' => ['sometimes', 'boolean'],
            'is_finished' => ['sometimes', 'boolean'],
            'note' => ['sometimes', 'nullable', 'string'],
            'ordered_at' => ['sometimes', 'date'],
            'items' => ['sometimes', 'array', 'min:1'],
            'items.*.product_id' => ['required_with:items', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required_with:items', 'integer', 'min:0'],
        ];
    }
}
