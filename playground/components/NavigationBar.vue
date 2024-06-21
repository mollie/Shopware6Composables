<script setup lang="ts"></script>

<template>
    <nav>
        <NuxtLink to="/">Default</NuxtLink>
        <NuxtLink to="/without">Lazy-loaded</NuxtLink>
    </nav>
</template>

<style scoped>
nav {
    display: flex;
    gap: 20px;
}
</style>
