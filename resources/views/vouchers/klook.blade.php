<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>TrekToo Booking Voucher - {{ $voucher_number }}</title>
    <style>
        body { font-family: 'DejaVu Sans', sans-serif; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #3B82F6; padding-bottom: 20px; }
        .logo { height: 60px; margin-bottom: 10px; }
        .voucher-number { color: #6B7280; font-size: 14px; }
        .section { margin: 20px 0; }
        .section-title { background-color: #3B82F6; color: white; padding: 8px 12px; font-weight: bold; }
        .details { padding: 15px; border: 1px solid #E5E7EB; }
        .detail-row { display: flex; margin: 8px 0; }
        .detail-label { font-weight: bold; width: 140px; color: #374151; }
        .detail-value { flex: 1; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB; text-align: center; color: #6B7280; font-size: 12px; }
        .qr-code { text-align: center; margin: 20px 0; }
        .important { background-color: #FEF3C7; padding: 15px; border-left: 4px solid #F59E0B; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="header">
        @if(file_exists($company_logo))
            <img src="{{ $company_logo }}" class="logo" alt="TrekToo Logo">
        @endif
        <h1>TrekToo Booking Voucher</h1>
        <p class="voucher-number">Voucher #: {{ $voucher_number }}</p>
        <p>Issued on: {{ $issue_date }}</p>
    </div>

    <div class="section">
        <div class="section-title">Booking Information</div>
        <div class="details">
            <div class="detail-row">
                <div class="detail-label">Booking Reference:</div>
                <div class="detail-value">{{ $order_details['bookings'][0]['booking_ref_number'] }}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Order Number:</div>
                <div class="detail-value">{{ $order_details['klktech_order_id'] }}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Activity:</div>
                <div class="detail-value">{{ $order_details['bookings'][0]['activity_name'] }}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Package:</div>
                <div class="detail-value">{{ $order_details['bookings'][0]['package_name'] }}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Status:</div>
                <div class="detail-value" style="color: green; font-weight: bold;">
                    {{ strtoupper($order_details['confirm_status']) }}
                </div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Customer Details</div>
        <div class="details">
            <div class="detail-row">
                <div class="detail-label">Name:</div>
                <div class="detail-value">
                    {{ $order_details['contact_info']['first_name'] }} {{ $order_details['contact_info']['family_name'] }}
                </div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Email:</div>
                <div class="detail-value">{{ $order_details['contact_info']['email'] }}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Phone:</div>
                <div class="detail-value">{{ $order_details['contact_info']['mobile'] }}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Country:</div>
                <div class="detail-value">{{ $order_details['contact_info']['country'] }}</div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Booking Details</div>
        <div class="details">
            @foreach($order_details['skus'] as $sku)
            <div class="detail-row">
                <div class="detail-label">SKU {{ $sku['sku_id'] }}:</div>
                <div class="detail-value">
                    {{ $sku['quantity'] }} x {{ $sku['sku_price'] }} {{ $sku['currency'] }}
                </div>
            </div>
            @endforeach
            <div class="detail-row">
                <div class="detail-label">Total Amount:</div>
                <div class="detail-value" style="font-weight: bold;">
                    {{ $order_details['total_amount'] }} {{ $order_details['currency'] }}
                </div>
            </div>
        </div>
    </div>

    @if(!empty($order_details['bookings'][0]['original_vouchers']))
    <div class="section">
        <div class="section-title">Voucher Codes</div>
        <div class="details">
            @foreach($order_details['bookings'][0]['original_vouchers'] as $voucher)
                @foreach($voucher['codes'] as $code)
                <div class="detail-row">
                    <div class="detail-label">Code:</div>
                    <div class="detail-value">{{ $code['code'] }} - {{ $code['description'] }}</div>
                </div>
                @endforeach
            @endforeach
        </div>
    </div>
    @endif

    @if(!empty($order_details['bookings'][0]['operator_contacts']))
    <div class="section">
        <div class="section-title">Operator Contact Information</div>
        <div class="details">
            @foreach($order_details['bookings'][0]['operator_contacts'] as $contact)
            <div class="detail-row">
                <div class="detail-label">{{ $contact['method'] }}:</div>
                <div class="detail-value">{{ implode(', ', $contact['details']) }}</div>
            </div>
            @endforeach
        </div>
    </div>
    @endif

    <div class="important">
        <h3>Important Information</h3>
        <p>• Please present this voucher and valid ID at the activity location</p>
        <p>• Voucher is valid only for the date and time specified</p>
        <p>• Cancellation policy: {{ $order_details['bookings'][0]['cancellation_policy'] ?? 'Please check activity terms' }}</p>
        <p>• For support, contact TrekToo at support@trektoo.com</p>
    </div>

    <div class="footer">
        <p>Generated by TrekToo - Your Adventure Partner</p>
        <p>www.trektoo.com | support@trektoo.com</p>
        <p>Voucher generated on: {{ $issue_date }}</p>
    </div>
</body>
</html>