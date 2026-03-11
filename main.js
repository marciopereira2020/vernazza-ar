<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>St Patrick AR 🍀</title>
<link rel="stylesheet" href="style.css">

<script type="module" src="main.js"></script>
<script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>

<style>
model-viewer {
  width: 100%;
  height: 100vh;
  display: none;
}
</style>

</head>
<body>

<button id="enterAR">🍀 Entrar na Experiência</button>

<model-viewer
  id="iosAR"
  src="modelo.glb"
  ios-src="modelo.usdz"
  ar
  ar-modes="quick-look"
  camera-controls>
</model-viewer>

</body>
</html>
