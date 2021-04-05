/**
 * @typedef {Object} RSSKeyUtil~IdxRange
 * @member {number} start
 * @member {number} end
 */


/**
 * Left-pad a number with zeroes to bring it up to a minimum width
 * @param {number} num number to pad
 * @param {number} minFieldSize minimun number of digits to output
 * @return {string} formatted number
 */
function leftPadInt(num, minFieldSize) {
	let retVal = "";
	
	if (minFieldSize >= 0) {
		let baseStr = new String(num);
		let diff = minFieldSize - baseStr.length;
		for (let i = 0; i < diff; ++i) {
			retVal += "0";
		}
		retVal += baseStr;
	}
	return retVal;
}

/**
 * Format a date to standardized string of YYYY-MM-DD
 * @param {Date} srcDate
 * @return {(string|null)} String if could be converted, null otherwise.
 */
function dateToString(srcDate) {
	let retVal = null;
	
	if (srcDate instanceof Date) {
		retVal =`${leftPadInt(srcDate.getUTCFullYear(),4)}-${leftPadInt(srcDate.getUTCMonth()+1,2)}-${leftPadInt(srcDate.getUTCDate(),2)}`; 
	}
	return retVal;
}

/**
 * Convert a string of date format YYYY-MM-DD to a string object.
 * @param {string} srcString
 * @return {(Date|null)} Date if could be converted, null otherwise.
 */
function stringToDate(srcString) {
	
	let retVal = null;
	
	if (typeof(srcString) === 'string') {
		let exp = /(\d{4})\-(\d{2})\-(\d{2})/;
		let match = srcString.match(exp);
		if (match) {
			let year = parseInt(match[1]);
			let month = parseInt(match[2]);
			let day = parseInt(match[3]);
			retVal = new Date(Date.UTC(year, month-1, day));
		}
	}
	
	return retVal;
}

export default {
	/** Extract the key value */
	/**
	 * Extract the key value (date) from RSS item.
	 * @param {Object} srcItem
	 * @return {(string|null)} key value as string. Null if not successful.
	 */
	getKeyParamStringFromRSSItem: function(srcItem) {
		let retVal;
		let srcDateMs;
		if (srcItem && srcItem['pubDate'] && (srcDateMs = Date.parse(srcItem['pubDate'])) ) {
			let srcDate = new Date(srcDateMs);
			retVal = dateToString(srcDate);
		}
		
		return retVal;
	},
	
	/**
	 * Get key value from key string
	 * @param {string} srcString
	 * @return {(Date|null)} object for value comparison, or null if not successful
	 */
	getKeyValueFromParamString: function(srcString) {
		return stringToDate(srcString);
	},
	
	/**
	 * Format key value into a string
	 * @param {Date} srcDate
	 * @return {(string|null)} formatted key string, or null if not successful
	 */
	getParamStringFromKeyValue: function(srcDate) {
		return dateToString(srcDate);
	},
	
	/**
	 * Given a sorted collection of episodes from an RSS feed,
	 * retrieve only those for the current date.
	 * @param {number} year full year
	 * @param {number} month 0-indexed month (0-11)
	 * @param {number} day day of month
	 * @param {Array<Object>} items array of episode items from RSS feed
	 * @return {RSSKeyUtil~IdxRange}
	 */
	getIndexesForUTCDate: function(
		year, // full year
		month, // 0-indexed month (0-11)
		day, // day of month
		items // array of episode items from RSS feed
	) {
		let normalizedDateMs = new Date(Date.UTC(year, month, day)).getTime();
		
		let retVal = { start: 0, end: 0};
		
		if (items && items.length > 0) {
			
			// normalize left and right pub dates down to just year,month,day
			// We're assuming array is sorted in descending order of pubDate
			let leftDate = new Date(Date.parse(items[0]['pubDate']));
			let leftDateMs = Date.UTC(leftDate.getUTCFullYear(), leftDate.getUTCMonth(), leftDate.getUTCDate());
			
			let rightDate = new Date(Date.parse(items[items.length - 1]['pubDate']));
			let rightDateMs = Date.UTC(rightDate.getUTCFullYear(), rightDate.getUTCMonth(), rightDate.getUTCDate());

			let foundIdx = -1;
			
			if (normalizedDateMs <= leftDateMs && normalizedDateMs >= rightDateMs) {
				// binary search for an entry that matches the date
				let leftIdx = 0;
				let rightIdx = items.length - 1;
				let idxDiff = items.length;
				let done = false;
				while(!done && foundIdx < 0 && idxDiff >= 0) {
					
					if (idxDiff == 1) {
						// We'll have to examine both the left and right.
						let leftDate = new Date(Date.parse(items[leftIdx]['pubDate']));
						let leftDateMs = Date.UTC(leftDate.getUTCFullYear(), leftDate.getUTCMonth(), leftDate.getUTCDate());
						let rightDate = new Date(Date.parse(items[rightIdx]['pubDate']));
						let rightDateMs = Date.UTC(rightDate.getUTCFullYear(), rightDate.getUTCMonth(), rightDate.getUTCDate());
						
						if (normalizedDateMs == leftDateMs) {
							foundIdx = leftIdx;
						} else if (normalizedDateMs == rightDateMs) {
							foundIdx = rightIdx;
						}
						
						done = true;
					} else {
						// keep looking at a middle
						let midIdx = Math.floor((rightIdx + leftIdx) / 2);
						let midDate = new Date(Date.parse(items[midIdx]['pubDate']))
						let midDateMs = Date.UTC(midDate.getUTCFullYear(), midDate.getUTCMonth(), midDate.getUTCDate());
						if (midDateMs == normalizedDateMs) {
							foundIdx = midIdx;
							done = true;
						} else if (normalizedDateMs > midDateMs) {
							rightIdx = midIdx;
						} else {
							// normalizedDateMs < midDateMs
							leftIdx = midIdx;
						}
					}
					
					idxDiff = rightIdx - leftIdx;
				}

			}// end if normalized date is within total range of pubDates
			
			if (foundIdx >= 0) {
				// Hey, we actually found something for the date.
				// Now, let's expand out in both directions to include the whole
				// block of items for the date
				
				let minIdx = foundIdx;
				let maxIdx = foundIdx;
				
				let curIdx = foundIdx - 1;
				while(curIdx >= 0) {
					let curDate = new Date(Date.parse(items[curIdx]['pubDate']));
					let curDateMs = Date.UTC(curDate.getUTCFullYear(), curDate.getUTCMonth(), curDate.getUTCDate());
					
					if (curDateMs == normalizedDateMs) {
						minIdx = curIdx;
					} else {
						break;
					}
					--curIdx;
				}
				
				curIdx = foundIdx + 1;
				while(curIdx < items.length) {
					let curDate = new Date(Date.parse(items[curIdx]['pubDate']));
					let curDateMs = Date.UTC(curDate.getUTCFullYear(), curDate.getUTCMonth(), curDate.getUTCDate());
					
					if (curDateMs == normalizedDateMs) {
						maxIdx = curIdx;
					} else {
						break;
					}
					++curIdx;
				}
				
				retVal.start = minIdx;
				retVal.end = maxIdx + 1;
			}
		}
		
		return retVal;
	}
};
