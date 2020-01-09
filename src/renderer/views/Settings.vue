<template>
    <div>
        <p class="md-title">Settings</p>
        <md-button @click="logOut" class="md-raised md-dense md-primary">Log out</md-button>
    </div>
</template>

<script>
    export default {
        name: "Settings",
        methods: {
            logOut() {
                localStorage.clear();
                location.href =location.origin + location.pathname
            }
        }
    }
</script>

<style scoped>
</style>