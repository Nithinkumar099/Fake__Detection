param([string]$ImagePath)

Add-Type -AssemblyName System.Runtime.WindowsRuntime
[Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType = WindowsRuntime] | Out-Null
[Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics, ContentType = WindowsRuntime] | Out-Null
[Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime] | Out-Null

$methods = [System.WindowsRuntimeSystemExtensions].GetMethods()
$asTask = $null
foreach ($m in $methods) {
    if ($m.Name -eq 'AsTask' -and $m.IsGenericMethodDefinition) {
        $params = $m.GetParameters()
        if ($params.Length -eq 1 -and $params[0].ParameterType.Name -eq 'IAsyncOperation`1') {
            $asTask = $m
            break
        }
    }
}

$stream = $null
try {
    $fullPath = [System.IO.Path]::GetFullPath($ImagePath)
    $fileOp = [Windows.Storage.StorageFile]::GetFileFromPathAsync($fullPath)
    $file = $asTask.MakeGenericMethod([Windows.Storage.StorageFile]).Invoke($null, @($fileOp)).GetAwaiter().GetResult()

    $streamOp = $file.OpenAsync([Windows.Storage.FileAccessMode]::Read)
    $stream = $asTask.MakeGenericMethod([Windows.Storage.Streams.IRandomAccessStream]).Invoke($null, @($streamOp)).GetAwaiter().GetResult()

    $decOp = [Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)
    $decoder = $asTask.MakeGenericMethod([Windows.Graphics.Imaging.BitmapDecoder]).Invoke($null, @($decOp)).GetAwaiter().GetResult()

    $bmpOp = $decoder.GetSoftwareBitmapAsync()
    $bitmap = $asTask.MakeGenericMethod([Windows.Graphics.Imaging.SoftwareBitmap]).Invoke($null, @($bmpOp)).GetAwaiter().GetResult()

    $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
    if (-not $engine) {
        $lang = [Windows.Globalization.Language]::new("en-US")
        $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage($lang)
    }

    $ocrOp = $engine.RecognizeAsync($bitmap)
    $ocrResult = $asTask.MakeGenericMethod([Windows.Media.Ocr.OcrResult]).Invoke($null, @($ocrOp)).GetAwaiter().GetResult()

    Write-Output $ocrResult.Text
} catch {
    Write-Error $_
} finally {
    if ($null -ne $stream) {
        $stream.Dispose()
    }
}
