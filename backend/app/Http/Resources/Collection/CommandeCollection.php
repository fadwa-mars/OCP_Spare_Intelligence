<?php

namespace App\Http\Resources\Collection;

use App\Http\Resources\CommandeResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class CommandeCollection extends ResourceCollection
{
    public function toArray(Request $request): array
    {
        return [
            'data' => CommandeResource::collection($this->collection),
            'meta' => [
                'total' => $this->total(),
                'count' => $this->count(),
                'per_page' => $this->perPage(),
                'current_page' => $this->currentPage(),
                'total_pages' => $this->lastPage(),
            ],
        ];
    }
}