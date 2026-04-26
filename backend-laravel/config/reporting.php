<?php

return [
    'weekly_recipients' => explode(',', env('WEEKLY_REPORT_RECIPIENTS', '')),
    'monthly_recipients' => explode(',', env('MONTHLY_REPORT_RECIPIENTS', '')),
    'default_format' => 'pdf',
];