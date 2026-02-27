<template>
  <CaseStudyEditor />
</template>

<script>
import CaseStudyEditor from "@/components/CaseStudyEditor/index.vue";

export default {
  layout: "adminLayout",
  middleware: "auth",
  components: {
    CaseStudyEditor
  }
};
</script>
