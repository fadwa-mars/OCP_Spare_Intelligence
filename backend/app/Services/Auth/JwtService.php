<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class JwtService
{
    /**
     * Générer un token JWT pour l'utilisateur
     */
    public function generateToken(User $user)
    {
        return $user->createToken('auth_token')->plainTextToken;
    }

    /**
     * Révoquer le token actuel
     */
    public function revokeToken($user)
    {
        $user->currentAccessToken()->delete();
        return true;
    }

    /**
     * Révoquer tous les tokens de l'utilisateur
     */
    public function revokeAllTokens($user)
    {
        $user->tokens()->delete();
        return true;
    }

    /**
     * Valider un token
     */
    public function validateToken($token)
    {
        $user = Auth::guard('sanctum')->user();
        return $user !== null;
    }

    /**
     * Vérifier si le token a expiré
     */
    public function isTokenExpired($user)
    {
        $token = $user->currentAccessToken();
        if ($token && $token->expires_at) {
            return now()->gt($token->expires_at);
        }
        return false;
    }

    /**
     * Rafraîchir le token (créer un nouveau, supprimer l'ancien)
     */
    public function refreshToken($user)
    {
        $this->revokeToken($user);
        return $this->generateToken($user);
    }
}