/*
 * Copyright (C) 2013 Iorga Group
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see [http://www.gnu.org/licenses/].
 */
(function (globals) {
	'use strict';

	globals.securityUtils = {
		/*
		 * httpRequestToSign = {
		 * 	 method: // string : 'GET'|'POST'...,
		 *   body: // string of the body of the request
		 *   headers: // {
		 *   	'Content-Type': // string for the contentType,
		 *   	'Date': // date,
		 *   	'X-RAAJ-Date': // forged date} ...
		 *   resource: // PATH-INFO + QUERY-STRING
		 * }
		 */
		computeData: function(httpRequestToSign) {
			var data = '';
			// HTTP method
			data += httpRequestToSign.method + '\n';
			// body MD5
			if (httpRequestToSign.body && httpRequestToSign.body.length > 0) {
				var hash = CryptoJS.MD5(httpRequestToSign.body);
				data += hash.toString(CryptoJS.enc.Hex);
			}
			data += '\n';
			// Content type
			if (httpRequestToSign.headers['Content-Type'] && httpRequestToSign.headers['Content-Type'].length > 0) {
				data += httpRequestToSign.headers['Content-Type'].toLowerCase();
			}
			data += '\n';
			/// Date
			var date = httpRequestToSign.headers['Date'], xraajdate;
			if (httpRequestToSign.headers['X-RAAJ-Date'] && httpRequestToSign.headers['X-RAAJ-Date'].length > 0) {
				xraajdate = httpRequestToSign.headers['X-RAAJ-Date'];
				date = xraajdate;
			}
			data += date + '\n';
			// Handling security additional headers
			//TODO handle this generically, see com.iorga.raaj.security.SecurityUtils.computeData(HttpRequestToSign)
			if (xraajdate) {
				data += 'x-raaj-date:' + xraajdate + '\n';
			}
			data += httpRequestToSign.resource + '\n';
			return data;
		},
		computeDataSignature: function(secretAccessKey, data) {
			var hash = CryptoJS.HmacSHA1(data, secretAccessKey);
			return hash.toString(CryptoJS.enc.Base64);
		},
		computeAuthorizationHeaderValue: function(accessKeyId, secretAccessKey, httpRequestToSign) {
			return 'IWS ' + accessKeyId + ':' + securityUtils.computeDataSignature(secretAccessKey, securityUtils.computeData(httpRequestToSign));
		},
		addAuthorizationHeader: function(accessKeyId, secretAccessKey, httpRequestToSign) {
			if (!httpRequestToSign.headers['X-RAAJ-Date'] && !httpRequestToSign.headers['Date']) {
				httpRequestToSign.headers['X-RAAJ-Date'] = new Date().toUTCString();
			}
			httpRequestToSign.headers['Authorization'] = securityUtils.computeAuthorizationHeaderValue(accessKeyId, secretAccessKey, httpRequestToSign);
		}
	};
})(this);