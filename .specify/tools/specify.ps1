[CmdletBinding()]
param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$SpecifyArgs
)

$ErrorActionPreference = 'Stop'
$source = 'git+https://github.com/github/spec-kit.git@v1.0.8'
& uvx --from $source specify @SpecifyArgs
exit $LASTEXITCODE