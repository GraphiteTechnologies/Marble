<div class="loader"></div>

<style>
  .loader {
    border: 4px solid var(--border-color);
    border-top: 4px solid var(--primary-accent);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 0 auto;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
