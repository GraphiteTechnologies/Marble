<div class="app-container welcome-container">
  <div class="graphics-container">
    <svg class="shape shape1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="50"/>
    </svg>
    <svg class="shape shape2" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="100" height="100" rx="20"/>
    </svg>
     <svg class="shape shape3" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 0 L100 100 L0 100 Z"/>
    </svg>
  </div>
  <div class="content">
    <h1>Welcome to Graphite OS</h1>
    <p>
      A modern, web-based operating system designed from the ground up to be:
    </p>
    <ul>
      <li><strong>Fast:</strong> Optimized for performance with a lightweight core.</li>
      <li><strong>Secure:</strong> Built with modern web technologies to keep you safe.</li>
      <li><strong>Lightweight:</strong> Runs efficiently in any modern browser.</li>
      <li><strong>Easy to Learn:</strong> A familiar and intuitive desktop experience.</li>
    </ul>
  </div>
</div>

<style>

  @import '../shell/AppKit.css';



  .welcome-container {

    display: flex;

    align-items: center;

    justify-content: center;

    gap: 40px;

    line-height: 1.6;

  }

  .graphics-container {

    position: relative;

    width: 150px;

    height: 150px;

    flex-shrink: 0;

  }

  .shape {

    position: absolute;

    width: 100px;

    height: 100px;

    filter: blur(10px);

    opacity: 0.5;

  }

  .shape1 {

    width: 80px;

    height: 80px;

    top: 10px;

    left: 10px;

    fill: rgba(255, 255, 255, 0.8);

    animation: float 8s ease-in-out infinite;

  }

  .shape2 {

    width: 70px;

    height: 70px;

    bottom: 10px;

    right: 10px;

    fill: rgba(255, 255, 255, 0.5);

    animation: float 10s ease-in-out infinite reverse;

  }

  .shape3 {

    display: none;

  }



  @keyframes float {

    0% { transform: translateY(0px) rotate(0deg); }

    50% { transform: translateY(-20px) rotate(45deg); }

    100% { transform: translateY(0px) rotate(0deg); }

  }



  .content {

    max-width: 400px;

  }

  h1 {

    font-size: var(--font-size-xl);

    margin-bottom: var(--spacing-medium);

    color: var(--primary-text);

  }

  ul {

    padding-left: 20px;

    list-style-type: '✓   ';

  }

  li {

    margin-bottom: 1em;

  }

  strong {

    color: var(--accent-color);

  }

</style>


