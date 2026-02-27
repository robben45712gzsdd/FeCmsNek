
<template>
  <div></div>
</template>

<script>
export default {
  layout: "adminLayout",
  middleware: "auth",
  mounted() {
    this.$router.replace("/overview");
  }
};
</script>
