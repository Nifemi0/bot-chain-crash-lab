Add-Type -AssemblyName System.Speech

$projectRoot = Split-Path -Parent $PSScriptRoot
$narrationPath = Join-Path $projectRoot "video\narration.txt"
$outputPath = Join-Path $projectRoot "public\voiceover\crash-lab-demo.wav"
$narration = Get-Content -LiteralPath $narrationPath -Raw

$synthesizer = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synthesizer.SelectVoice("Microsoft David Desktop")
$synthesizer.Rate = 2
$synthesizer.Volume = 100
$synthesizer.SetOutputToWaveFile($outputPath)
$synthesizer.Speak($narration)
$synthesizer.Dispose()

Write-Output $outputPath
