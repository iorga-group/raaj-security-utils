/*
 * Copyright (C) 2014 Iorga Group
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
(function () {
	'use strict';

    angular.module('raajSecurityUtils', [])
    	.factory('raajSecurityUtils', function() {
    		var securityUtils = {
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
					var contentType = httpRequestToSign.headers['Content-Type'];
					if (contentType && contentType.length > 0) {
						data += contentType.toLowerCase();
					}
					data += '\n';
					/// Date
					var date = httpRequestToSign.headers['Date'],
						xraajdate = httpRequestToSign.headers['X-RAAJ-Date'];
					if (xraajdate && xraajdate.length > 0) {
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
    		return securityUtils;
    	})
    	.factory('RaajAesUtil', function() {
			var AesUtil = function(keySize, iterationCount) {
				this.keySize = keySize / 32;
				this.iterationCount = iterationCount;
			};
	
			AesUtil.prototype.generateKey = function(salt, passPhrase) {
				var key = CryptoJS.PBKDF2(passPhrase, CryptoJS.enc.Hex.parse(salt), {
					keySize : this.keySize,
					iterations : this.iterationCount
				});
				return key;
			}
	
			AesUtil.prototype.encrypt = function(salt, iv, passPhrase, plainText) {
				var key = this.generateKey(salt, passPhrase);
				var encrypted = CryptoJS.AES.encrypt(plainText, key, {
					iv : CryptoJS.enc.Hex.parse(iv)
				});
				return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
			}
	
			AesUtil.prototype.decrypt = function(salt, iv, passPhrase, cipherText) {
				var key = this.generateKey(salt, passPhrase);
				var cipherParams = CryptoJS.lib.CipherParams.create({
					ciphertext : CryptoJS.enc.Base64.parse(cipherText)
				});
				var decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
					iv : CryptoJS.enc.Hex.parse(iv)
				});
				return decrypted.toString(CryptoJS.enc.Utf8);
			}
			
			return AesUtil;
    	})
    	;
})();