<?php

namespace App\Http\Controllers;

use App\Http\Requests\PurchaseGroupCreateRequest;
use App\Http\Requests\PurchaseGroupUpdateRequest;
use App\Models\PurchaseGroup;
use Illuminate\Http\JsonResponse;

class PurchaseGroupController extends Controller
{
    public function index(): JsonResponse
    {
        $groups = PurchaseGroup::all();

        return response()->json($groups);
    }

    public function store(PurchaseGroupCreateRequest $request): JsonResponse
    {
        $group = PurchaseGroup::create($request->validated());

        return response()->json($group, 201);
    }

    public function show(PurchaseGroup $purchaseGroup): JsonResponse
    {
        return response()->json($purchaseGroup);
    }

    public function update(PurchaseGroupUpdateRequest $request, PurchaseGroup $purchaseGroup): JsonResponse
    {
        $fields = ['name', 'description', 'status', 'started_at', 'ended_at'];

        $data = collect($fields)
            ->filter(fn($field) => $request->has($field))
            ->mapWithKeys(fn($field) => [$field => $request->input($field)])
            ->toArray();

        $purchaseGroup->update($data);

        return response()->json($purchaseGroup);
    }

    public function destroy(PurchaseGroup $purchaseGroup): JsonResponse
    {
        $purchaseGroup->delete();

        return response()->json(null, 204);
    }
}
