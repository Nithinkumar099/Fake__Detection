param([string]$ImagePath)

[Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType = WindowsRuntime] | Out-Null
[Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics, ContentType = WindowsRuntime] | Out-Null
[Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime] | Out-Null

try {
    $asyncOp = [Windows.Storage.StorageFile]::GetFileFromPathAsync($ImagePath)
    $file = $asyncOp.GetAwaiter().GetResult()
    $streamOp = $file.OpenAsync([Windows.Storage.FileAccessMode]::Read)
    $stream = $streamOp.GetAwaiter().GetResult()
    $decoderOp = [Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)
    $decoder = $decoderOp.GetAwaiter().GetResult()
    $bmpOp = $decoder.GetSoftwareBitmapAsync()
    $bitmap = $bmpOp.GetAwaiter().GetResult()

    $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
    if (-not $engine) {
        $lang = [Windows.Globalization.Language]::new("en-US")
        $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage($lang)
    }
    $ocrOp = $engine.RecognizeAsync($bitmap)
    $result = $ocrOp.GetAwaiter().GetResult()
    Write-Output $result.Text
} catch {
    Write-Error $_
}
